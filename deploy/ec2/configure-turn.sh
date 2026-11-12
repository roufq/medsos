#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ "$EUID" -eq 0 && "$(uname -s)" == Linux ]] || { echo 'Run with sudo on EC2 Ubuntu.' >&2; exit 1; }
[[ -f /opt/postter/.env && ! -L /opt/postter/.env ]] || exit 1
exec 9>/run/lock/postter-turn.lock
flock -n 9 || { echo 'Another TURN configuration is running.' >&2; exit 1; }
if systemctl is-active --quiet coturn && ! grep -q '^# Managed by Postter$' /etc/turnserver.conf; then
  echo 'An existing TURN service was found. Preserve its configuration and use doc/CALLS_EC2.md.' >&2
  exit 1
fi
if [[ $# -eq 2 ]]; then
  public_ip="$1"; private_ip="$2"
elif [[ $# -eq 0 ]]; then
  token="$(curl --fail --silent --show-error --connect-timeout 2 --max-time 5 -X PUT \
    -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' http://169.254.169.254/latest/api/token)"
  public_ip="$(curl --fail --silent --show-error --connect-timeout 2 --max-time 5 \
    -H "X-aws-ec2-metadata-token: $token" http://169.254.169.254/latest/meta-data/public-ipv4)"
  private_ip="$(curl --fail --silent --show-error --connect-timeout 2 --max-time 5 \
    -H "X-aws-ec2-metadata-token: $token" http://169.254.169.254/latest/meta-data/local-ipv4)"
  unset token
else
  echo 'Usage: sudo bash configure-turn.sh [PUBLIC_IPV4 PRIVATE_IPV4]' >&2; exit 64
fi
python3 - "$public_ip" "$private_ip" <<'PY'
import ipaddress, sys
public, private = [ipaddress.IPv4Address(value) for value in sys.argv[1:]]
if not public.is_global or not private.is_private:
    sys.exit('Expected a public IPv4 address and EC2 private IPv4 address.')
PY
backup="$(mktemp -d /var/backups/postter-turn.XXXXXXXX)"
chmod 700 "$backup"
cp -a /opt/postter/.env "$backup/environment"
if [[ -f /etc/turnserver.conf ]]; then cp -a /etc/turnserver.conf "$backup/turnserver.conf"; fi
secret=''
if grep -q '^# Managed by Postter$' /etc/turnserver.conf 2>/dev/null; then
  secret="$(sed -n 's/^static-auth-secret=//p' /etc/turnserver.conf)"
fi
[[ "$secret" =~ ^[a-f0-9]{64}$ ]] || secret="$(openssl rand -hex 32)"
# Write authenticated configuration before installing: package startup must not expose an open relay.
cat > /etc/turnserver.conf <<CONF
# Managed by Postter
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=${secret}
realm=postter.us
external-ip=${public_ip}/${private_ip}
min-port=49160
max-port=49260
no-tls
no-dtls
no-cli
no-multicast-peers
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=::1
denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff
user-quota=12
total-quota=120
CONF
getent group turnserver >/dev/null || groupadd --system turnserver
chown root:turnserver /etc/turnserver.conf
chmod 640 /etc/turnserver.conf
export DEBIAN_FRONTEND=noninteractive
apt-get install -y -o Dpkg::Options::=--force-confold coturn
chown root:turnserver /etc/turnserver.conf
chmod 640 /etc/turnserver.conf
# Pipe secrets directly into the editor; never put them in command arguments or print .env.
printf '%s\n%s\n' "turn:${public_ip}:3478?transport=udp,turn:${public_ip}:3478?transport=tcp" "$secret" |
  python3 -c '
import re, sys
urls, secret = sys.stdin.read().splitlines()
path = "/opt/postter/.env"
text = open(path).read()
for key, value in {"TURN_URLS": urls, "TURN_SHARED_SECRET": secret}.items():
    text = re.sub(r"(?m)^\s*(?:export\s+)?" + key + r"\s*=.*\n?", "", text)
    text = text.rstrip("\n") + "\n" + key + "=" + value + "\n"
with open(path, "w") as output:
    output.write(text)
'
unset secret
systemctl enable coturn
systemctl restart coturn
systemctl is-active --quiet coturn
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 3478/tcp
  ufw allow 3478/udp
  ufw allow 49160:49260/udp
fi
systemctl restart postter
systemctl is-active postter coturn
echo "TURN configured for $public_ip. Private backup: $backup"
echo 'AWS Security Group still needs inbound TCP 3478, UDP 3478 and UDP 49160-49260.'
echo 'TURN TLS is not enabled; test from Wi-Fi and mobile data after opening the ports.'
