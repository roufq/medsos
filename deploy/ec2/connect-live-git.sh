#!/usr/bin/env bash
set -euo pipefail
umask 022

app_dir=/opt/postter
key=/home/ubuntu/.ssh/postter_github
branch=production

if [[ "$EUID" -ne 0 ]]; then
  echo 'Run with sudo on the EC2 instance.' >&2
  exit 1
fi
if [[ ! -f "$app_dir/.env" || ! -f "$app_dir/postter" || ! -f "$key" ]]; then
  echo 'Existing Postter application or GitHub deploy key was not found.' >&2
  exit 1
fi
if [[ -e "$app_dir/.git" ]]; then
  echo '/opt/postter already has Git metadata. Inspect it before running this migration again.' >&2
  exit 1
fi

ssh_command="ssh -i $key -o IdentitiesOnly=yes -o UserKnownHostsFile=/home/ubuntu/.ssh/known_hosts"
if ! git -c core.sshCommand="$ssh_command" ls-remote --exit-code --heads git@github.com:roufq/medsos.git "refs/heads/$branch" >/dev/null; then
  echo "Cannot access remote branch $branch. Check the deploy key and create the branch before connecting." >&2
  exit 1
fi

backup_dir="$(mktemp -d /var/backups/postter-before-git.XXXXXXXX)"
chmod 0700 "$backup_dir"
tar -czf "$backup_dir/application.tar.gz" -C /opt postter
chmod 0600 "$backup_dir/application.tar.gz"
env_hash="$(sha256sum "$app_dir/.env")"
binary_hash="$(sha256sum "$app_dir/postter")"

git -C "$app_dir" init --initial-branch="$branch"
chmod 0700 "$app_dir/.git"
git -C "$app_dir" remote add origin git@github.com:roufq/medsos.git
git -C "$app_dir" config core.sshCommand "$ssh_command"
git -C "$app_dir" fetch origin "$branch"

# Refuse any revision that would replace live configuration or runtime data.
git -C "$app_dir" ls-tree -r --name-only "origin/$branch" > "$backup_dir/tracked-files.txt"
if grep -Eq '^(\.env($|\.)|uploads(/|$)|storage(/|$)|postter$|frontend/dist(/|$))' "$backup_dir/tracked-files.txt"; then
  echo 'Repository tracks protected runtime files. Checkout was not applied; inspect the tracked-file list in the backup.' >&2
  exit 1
fi
printf '\n/.env\n/.env.*\n/postter\n/frontend/dist/\n/uploads/\n/storage/\n' >> "$app_dir/.git/info/exclude"

# This is a new repository: mixed reset only sets its index/branch, preserving disk files.
git -C "$app_dir" reset --mixed "origin/$branch" >/dev/null
git -C "$app_dir" restore --source="origin/$branch" --worktree -- .
git -C "$app_dir" branch --set-upstream-to="origin/$branch" "$branch"

[[ "$env_hash" == "$(sha256sum "$app_dir/.env")" ]]
[[ "$binary_hash" == "$(sha256sum "$app_dir/postter")" ]]
git -C "$app_dir" remote -v
git -C "$app_dir" status --short --branch
printf '\nConnected /opt/postter to GitHub branch %s. Backup: %s\n' "$branch" "$backup_dir"
echo 'The running binary, frontend build, environment, database, and uploads were not replaced.'
echo 'Future git pulls update source here; rebuild and deploy before restarting to publish code changes.'
