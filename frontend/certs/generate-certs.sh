#!/bin/sh
# Generate a self-signed TLS cert/key pair for HTTPS, covering:
#   - localhost
#   - 127.0.0.1
#   - an optional host LAN IP (host device wifi IP, not the container's internal IP)
#
# Usage:
#   ./generate-dev-certs.sh             # localhost + 127.0.0.1 only
#   ./generate-dev-certs.sh <host-ip>   # also include host IP (IPv4)

set -e

CERT_DIR="/workspaces/bookfinder/frontend/certs"
DAYS=365
LAN_IP="$1"

mkdir -p "$CERT_DIR"

SAN="DNS:localhost,IP:127.0.0.1"
if [ -n "$LAN_IP" ]; then
  SAN="$SAN,IP:$LAN_IP"
  echo "Creating cert for localhost / 127.0.0.1 and $LAN_IP"
else
  echo "Creating cert for localhost / 127.0.0.1."
  echo "Run '$CERT_DIR/generate-dev-certs.sh <host-ip>' if you want to add the host's LAN IP to the cert."
fi

openssl req -x509 -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -days "$DAYS" \
  -nodes \
  -subj "/CN=localhost" \
  -addext "subjectAltName=$SAN"

echo ""
echo "Done. Cert valid for $DAYS days, expiring on:"
openssl x509 -enddate -noout -in "$CERT_DIR/cert.pem"  | cut -d= -f2
echo "Files written to $CERT_DIR"