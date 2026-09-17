# CyberLab — Cybersecurity Practical Lab Platform

A subscription-based cybersecurity practical-learning SaaS. Students choose a
learning pathway, launch isolated labs on demand, follow guided exercises,
submit flags and a findings report, and progress through a structured
curriculum.

The full product and technical blueprint — including the six novel
differentiators (procedurally mutated labs, tradecraft telemetry scoring, an
AI Socratic mentor, AI-graded findings reports, attack→detection feedback,
and a verifiable skills passport) that set this apart from static-machine
platforms like TryHackMe or HTB Academy — is documented in
[`docs/blueprint.md`](docs/blueprint.md).

## Status

Early implementation: Next.js dashboard shell (`apps/web`), FastAPI backend
+ Postgres schema (`apps/api`), and a Docker Compose stack fronted by nginx
are in place. Lab provisioning, auth, and the AI-driven features are not
built yet — see the blueprint's build order (§29).

## Running locally

```bash
cp .env.example .env   # set DOMAIN / CERTBOT_EMAIL if different
docker compose up --build
```

This starts Postgres, the API, the web app, and an nginx reverse proxy in
front of both, terminating TLS. On first run, a `certbot-init` step drops in
a self-signed placeholder certificate so nginx can start immediately —
without any DNS or domain setup, you can reach the stack at
`https://localhost/` (expect a browser certificate warning; that's the
self-signed placeholder, not a bug) or by name with:

```bash
curl -k https://localhost/ -H "Host: ${DOMAIN:-smartcloud9.online}"
curl -k https://localhost/api/health -H "Host: ${DOMAIN:-smartcloud9.online}"
```

### Getting a real TLS certificate

Once this stack is actually deployed on a host that `$DOMAIN`'s DNS record
points at, with ports 80/443 reachable from the public internet, run:

```bash
./init-letsencrypt.sh
```

once to swap the self-signed placeholder for a real Let's Encrypt
certificate. The `certbot` service then keeps it renewed automatically. This
step cannot succeed from a machine the domain doesn't actually point at —
Let's Encrypt validates ownership by reaching `$DOMAIN` over the internet.
