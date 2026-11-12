#!/usr/bin/env bash
set -euo pipefail
umask 027
app=/opt/postter
[[ "$EUID" -eq 0 && "$(uname -s)" == Linux && "$(uname -m)" == x86_64 ]] || {
  echo 'Run with sudo on the Ubuntu x86_64 server.' >&2; exit 1;
}
[[ "$(realpath -e "$app")" == "$app" && -f "$app/.env" && -x "$app/postter" ]] || exit 1
[[ "$(systemctl show postter -p WorkingDirectory --value)" == "$app" ]] || exit 1
exec 9>/run/lock/postter-update.lock
flock -n 9 || { echo 'Another deployment is running.' >&2; exit 1; }
cd "$app"
[[ "$(git branch --show-current)" == production ]] || { echo 'Switch to production first.' >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Save source changes before deploying.' >&2; git status -sb; exit 1; }
for tool in go node npm python3 mysqldump curl; do command -v "$tool" >/dev/null || { echo "Missing $tool; run prepare-build-tools.sh first." >&2; exit 1; }; done
git pull --ff-only origin production
revision="$(git rev-parse HEAD)"
build="$(mktemp -d /var/tmp/postter-build.XXXXXXXX)"
backup="$(mktemp -d /var/backups/postter-update.XXXXXXXX)"
chmod 700 "$build" "$backup"
echo "Building $revision in $build. Existing app remains running."
git archive HEAD | tar -xf - -C "$build"
(
  cd "$build/frontend"
  npm ci --no-audit --no-fund
  NODE_OPTIONS=--max-old-space-size=1024 npm run build
)
(
  cd "$build"
  CGO_ENABLED=0 GOTOOLCHAIN=auto GOMAXPROCS=1 GOMEMLIMIT=512MiB go build -p 1 -trimpath -o postter .
)
[[ -s "$build/postter" && -s "$build/frontend/dist/index.html" ]] || exit 1
database="$(python3 - "$app/.env" <<'PY'
import re, shlex, sys
values = {}
for line in open(sys.argv[1]):
    match = re.match(r'^\s*(?:export\s+)?DB_DATABASE\s*=\s*(.*)$', line)
    if match:
        parts = shlex.split(match[1], comments=True)
        values['database'] = parts[0] if parts else ''
name = values.get('database', '')
if not re.fullmatch(r'[A-Za-z0-9_]+', name):
    sys.exit('DB_DATABASE is missing or invalid; no runtime files changed.')
print(name)
PY
)"
cp -a "$app/.env" "$app/postter" "$app/resources" "$backup/"
cp -a "$app/frontend/dist" "$backup/dist"
printf '%s\n' "$revision" > "$backup/new-revision.txt"

stopped=false
changed=false
recover() {
  local status=$?
  trap - ERR
  set +e
  if [[ "$changed" == true ]]; then
    systemctl stop postter
    install -o root -g postter -m 0750 "$backup/postter" "$app/postter.rollback"
    mv -f "$app/postter.rollback" "$app/postter"
    [[ ! -e "$app/frontend/dist" ]] || mv "$app/frontend/dist" "$backup/failed-dist"
    cp -a "$backup/dist" "$app/frontend/dist"
    [[ ! -e "$app/resources" ]] || mv "$app/resources" "$backup/failed-resources"
    cp -a "$backup/resources" "$app/resources"
  fi
  if [[ "$stopped" == true ]]; then systemctl start postter; fi
  echo "Deployment failed. Runtime rollback attempted. Backup: $backup" >&2
  echo 'Database was NOT automatically restored. Inspect journalctl -u postter.' >&2
  exit "$status"
}
trap recover ERR
echo 'Build complete. Stopping Postter briefly for backup and activation.'
systemctl stop postter
stopped=true
mysqldump --single-transaction --routines --triggers --events --databases "$database" > "$backup/database.sql"
tar -czf "$backup/user-files.tar.gz" -C "$app" uploads storage

changed=true
install -o root -g postter -m 0750 "$build/postter" "$app/postter.next"
mv -f "$app/postter.next" "$app/postter"
mv "$app/frontend/dist" "$backup/retired-dist"
cp -a "$build/frontend/dist" "$app/frontend/dist"
mv "$app/resources" "$backup/retired-resources"
cp -a "$build/resources" "$app/resources"
chown -R root:postter "$app/frontend/dist" "$app/resources"
chmod -R g+rX,o-rwx "$app/frontend/dist" "$app/resources"
systemctl start postter
ready=false
for attempt in {1..30}; do
  if curl --fail --silent --max-time 5 http://127.0.0.1:3000/api/v1/health/ready > /dev/null; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]]
curl --fail --silent --show-error --max-time 10 -H 'Host: postter.us' http://127.0.0.1/api/v1/health/ready
trap - ERR
echo
echo "Postter updated to $revision. Backup: $backup"
echo "Build folder: $build (can be removed after verification)."
systemctl is-active postter
git status -sb
