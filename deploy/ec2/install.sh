#!/usr/bin/env bash
set -euo pipefail
umask 027

if [[ $# -ne 2 || ! "$1" =~ ^[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9]$ || ! "$2" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  echo 'Usage: sudo bash install.sh DOMAIN PUBLIC_IPV4' >&2
  exit 64
fi
if [[ "$EUID" -ne 0 || "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo 'Run this installer with sudo on the Ubuntu x86_64 EC2 instance.' >&2
  exit 1
fi

domain="$1"
public_ip="$2"
package_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_dir=/opt/postter

# This installs a fresh server; never replace existing credentials or user data.
if [[ -e "$app_dir" || -e /etc/systemd/system/postter.service || -e /etc/nginx/sites-available/postter ]]; then
  echo 'An existing Postter installation was found. Stop here and use an update procedure.' >&2
  exit 1
fi
if [[ ! -f "$package_dir/postter" || ! -f "$package_dir/frontend/dist/index.html" ]]; then
  echo 'Extract the complete deployment archive before running this installer.' >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx mysql-server ffmpeg openssl ca-certificates curl certbot python3-certbot-nginx
systemctl enable --now mysql nginx

if [[ "$(mysql --batch --skip-column-names -e "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name='postter'")" != 0 ]]; then
  echo 'Database postter already exists. It has not been modified.' >&2
  exit 1
fi
if id postter >/dev/null 2>&1; then
  echo 'User postter already exists. Inspect the server before continuing.' >&2
  exit 1
fi

db_password="$(openssl rand -hex 24)"
app_key="$(openssl rand -hex 16)"
jwt_secret="$(openssl rand -hex 32)"
mysql <<SQL
CREATE DATABASE postter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'postter'@'127.0.0.1' IDENTIFIED BY '${db_password}';
GRANT ALL PRIVILEGES ON postter.* TO 'postter'@'127.0.0.1';
SQL

useradd --system --user-group --home-dir "$app_dir" --shell /usr/sbin/nologin postter
install -d -o root -g postter -m 0750 "$app_dir"
install -o root -g postter -m 0750 "$package_dir/postter" "$app_dir/postter"
cp -R "$package_dir/frontend" "$package_dir/resources" "$app_dir/"
chown -R root:postter "$app_dir/frontend" "$app_dir/resources"
chmod -R g+rX,o-rwx "$app_dir/frontend" "$app_dir/resources"
install -d -o postter -g postter -m 0750 "$app_dir/uploads" "$app_dir/storage" \
  "$app_dir/storage/logs" "$app_dir/storage/framework/sessions" \
  "$app_dir/storage/framework/cache" "$app_dir/storage/framework/views"

cat > "$app_dir/.env" <<ENV
APP_NAME=Postter
APP_ENV=production
APP_DEBUG=false
APP_KEY=${app_key}
JWT_SECRET=${jwt_secret}
APP_HOST=127.0.0.1
APP_PORT=3000
APP_URL=http://${domain}
FRONTEND_URL=http://${domain}
CORS_ALLOWED_ORIGINS=http://${domain}
SESSION_SECURE=false
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=postter
DB_USERNAME=postter
DB_PASSWORD=${db_password}
DB_MAX_OPEN_CONNS=10
DB_MAX_IDLE_CONNS=2
DB_CONN_MAX_IDLE_SECONDS=300
DB_CONN_MAX_LIFETIME_SECONDS=1800
QUEUE_CONNECTION=database
QUEUE_CONCURRENT=1
QUEUE_RETRY_AFTER_SECONDS=3600
LOG_CHANNEL=daily
LOG_LEVEL=warning
HTTP_BODY_LIMIT_KB=1054720
HTTP_REQUEST_TIMEOUT_SECONDS=120
MEDIA_MAX_IMAGE_MB=10
MEDIA_MAX_UPLOAD_MB=1024
SEED_DEFAULT_ADMIN=false
VERIFICATION_DEV_MODE=false
OAUTH_DEV_MODE=false
ENV
chown root:postter "$app_dir/.env"
chmod 0640 "$app_dir/.env"
unset db_password app_key jwt_secret

cat > /etc/systemd/system/postter.service <<'UNIT'
[Unit]
Description=Postter web application
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=postter
Group=postter
WorkingDirectory=/opt/postter
EnvironmentFile=/opt/postter/.env
ExecStart=/opt/postter/postter
Restart=on-failure
RestartSec=5
UMask=0027
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/opt/postter/uploads /opt/postter/storage

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/nginx/sites-available/postter <<NGINX
server {
    listen 80;
    server_name ${domain} ${public_ip};
    client_max_body_size 1030m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
NGINX
ln -s /etc/nginx/sites-available/postter /etc/nginx/sites-enabled/postter
nginx -t
systemctl daemon-reload
systemctl enable --now postter

ready=false
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:3000/api/v1/health/ready >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  echo 'Backend is not ready. Inspect: sudo journalctl -u postter -n 80 --no-pager' >&2
  exit 1
fi
systemctl reload nginx
curl --fail --silent -H "Host: ${domain}" http://127.0.0.1/api/v1/health/ready
printf '\nPostter is running. Open http://%s, then configure HTTPS.\n' "$domain"
