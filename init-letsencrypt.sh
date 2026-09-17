#!/usr/bin/env bash
# Run this ONCE on the host actually serving $DOMAIN, after its DNS record
# points here and ports 80/443 are reachable from the public internet.
# docker compose up on its own (including in local/dev use) already works
# without this script, using a self-signed placeholder certificate from the
# certbot-init service — this script swaps that placeholder for a real
# Let's Encrypt certificate.
set -euo pipefail

DOMAIN="${DOMAIN:-smartcloud9.online}"
EMAIL="${CERTBOT_EMAIL:-chukwunonsosmartagbawo@gmail.com}"

echo "### Requesting a Let's Encrypt certificate for $DOMAIN ($EMAIL)"

echo "### Starting/ensuring the stack is up"
docker compose up -d

echo "### Removing the self-signed placeholder certificate"
docker compose run --rm --entrypoint "sh -c 'rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

echo "### Requesting the real certificate via the HTTP-01 challenge"
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --rsa-key-size 2048 --agree-tos --no-eff-email" certbot

echo "### Reloading nginx to pick up the real certificate"
docker compose exec nginx nginx -s reload

echo "### Done — $DOMAIN should now be serving a real Let's Encrypt certificate."
echo "### The certbot service will keep it renewed automatically."
