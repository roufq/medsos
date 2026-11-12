#!/usr/bin/env bash
set -euo pipefail
umask 027

if [[ $# -ne 1 || ! "$1" =~ ^[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9]$ ]]; then
  echo 'Usage: sudo bash enable-https.sh DOMAIN' >&2
  exit 64
fi
if [[ "$EUID" -ne 0 || ! -f /opt/postter/.env ]]; then
  echo 'Run with sudo after installing Postter.' >&2
  exit 1
fi
domain="$1"
# DNS must point to this server and EC2 must allow inbound TCP 80 and 443.
certbot --nginx --domain "$domain" --redirect
sed -i \
  -e "s|^APP_URL=.*|APP_URL=https://${domain}|" \
  -e "s|^FRONTEND_URL=.*|FRONTEND_URL=https://${domain}|" \
  -e "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://${domain}|" \
  -e 's|^SESSION_SECURE=.*|SESSION_SECURE=true|' /opt/postter/.env
systemctl restart postter
systemctl enable --now certbot.timer
ready=false
for attempt in {1..30}; do
  if curl --fail --silent --resolve "${domain}:443:127.0.0.1" "https://${domain}/api/v1/health/ready" >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  echo 'HTTPS readiness failed. Inspect: sudo journalctl -u postter -n 80 --no-pager' >&2
  exit 1
fi
printf 'HTTPS is ready: https://%s\n' "$domain"
