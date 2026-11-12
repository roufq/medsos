#!/usr/bin/env bash
set -euo pipefail
umask 027
[[ "$EUID" -eq 0 && "$(uname -s)" == Linux && "$(uname -m)" == x86_64 ]] || {
  echo 'Run with sudo on the Ubuntu x86_64 server.' >&2; exit 1;
}
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git python3 xz-utils openssl

if ! command -v go >/dev/null; then
  work="$(mktemp -d /var/tmp/postter-go.XXXXXXXX)"
  curl --fail --silent --show-error --location --max-time 120 \
    'https://go.dev/dl/?mode=json' -o "$work/releases.json"
  read -r archive checksum < <(python3 - "$work/releases.json" <<'PY'
import json, re, sys
for release in json.load(open(sys.argv[1])):
    if release.get('stable'):
        for item in release['files']:
            if item['os'] == 'linux' and item['arch'] == 'amd64' and item['kind'] == 'archive':
                name, checksum = item['filename'], item['sha256']
                if re.fullmatch(r'go1\.[0-9]+\.[0-9]+\.linux-amd64\.tar\.gz', name) and re.fullmatch(r'[a-f0-9]{64}', checksum):
                    print(name, checksum)
                    sys.exit(0)
sys.exit('No stable Go archive found.')
PY
)
  [[ "$archive" =~ ^go1\.[0-9]+\.[0-9]+\.linux-amd64\.tar\.gz$ && "$checksum" =~ ^[a-f0-9]{64}$ ]] || exit 1
  curl --fail --silent --show-error --location --max-time 600 "https://go.dev/dl/$archive" -o "$work/$archive"
  (cd "$work"; printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --strict -)
  target="/opt/postter-${archive%.linux-amd64.tar.gz}"
  [[ ! -e "$target" ]] || { echo "Inspect existing $target before installing." >&2; exit 1; }
  install -d -m 0755 "$target"
  tar -xzf "$work/$archive" -C "$target" --strip-components=1 --no-same-owner
  for executable in go gofmt; do ln -sfn "$target/bin/$executable" "/usr/local/bin/$executable"; done
fi

# Use the official Node 24 archive; Ubuntu 24.04's default Node is too old for Vite.
if ! command -v node >/dev/null || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 24 ? 0 : 1)'; then
  work="$(mktemp -d /var/tmp/postter-node.XXXXXXXX)"
  curl --fail --silent --show-error --location --max-time 120 \
    https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt -o "$work/SHASUMS256.txt"
  archive="$(awk '$2 ~ /^node-v24\.[0-9]+\.[0-9]+-linux-x64\.tar\.xz$/ {print $2}' "$work/SHASUMS256.txt")"
  [[ "$archive" =~ ^node-v24\.[0-9]+\.[0-9]+-linux-x64\.tar\.xz$ ]] || { echo 'Cannot select Node archive.' >&2; exit 1; }
  curl --fail --silent --show-error --location --max-time 600 \
    "https://nodejs.org/dist/latest-v24.x/$archive" -o "$work/$archive"
  (cd "$work"; awk -v file="$archive" '$2 == file' SHASUMS256.txt | sha256sum --check --strict -)
  target="/opt/${archive%.tar.xz}"
  [[ ! -e "$target" ]] || { echo "Inspect existing $target before installing." >&2; exit 1; }
  tar -xJf "$work/$archive" -C /opt --no-same-owner
  for executable in node npm npx; do
    ln -sfn "$target/bin/$executable" "/usr/local/bin/$executable"
  done
fi

# Leave some headroom for MySQL and Postter while building on a 2 GiB instance.
if [[ "$(awk '/MemTotal/ {print $2}' /proc/meminfo)" -lt 3145728 ]] && [[ "$(awk '/SwapTotal/ {print $2}' /proc/meminfo)" -eq 0 ]]; then
  [[ ! -e /postter.swap ]] || { echo 'Existing /postter.swap needs inspection.' >&2; exit 1; }
  [[ "$(df --output=avail -k / | tail -1)" -gt 4194304 ]] || { echo 'Not enough disk space for swap.' >&2; exit 1; }
  fallocate -l 2G /postter.swap
  chmod 600 /postter.swap
  mkswap /postter.swap
  swapon /postter.swap
  grep -qE '^/postter\.swap[[:space:]]' /etc/fstab || printf '/postter.swap none swap sw 0 0\n' >> /etc/fstab
fi
cd /opt/postter
GOTOOLCHAIN=auto go version
node --version
npm --version
free -h
