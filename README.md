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

## Running it

Two compose files, for two different purposes — don't run both at once,
they claim the same host ports.

### Local Docker Desktop dev (`docker-compose.local.yml`)

Plain and fast: Postgres, the API, and the web app, each published directly
on their usual ports — no nginx, no TLS, nothing to configure.

```bash
docker compose -f docker-compose.local.yml up --build
```

- Web: http://localhost:3000
- API: http://localhost:8000/api/health
- Postgres: localhost:5432

### Cloud/domain deployment base (`docker-compose.yml`)

The production-shaped stack: the same Postgres/API/web services, but fronted
by nginx terminating TLS, with Let's Encrypt wired up for `$DOMAIN`. This is
the one meant to run on an actual host that `$DOMAIN`'s DNS points at — see
[`docs/blueprint.md`](docs/blueprint.md) for the AWS deployment target.

```bash
cp .env.example .env   # set DOMAIN / CERTBOT_EMAIL if different
docker compose up --build
```

On first run, a `certbot-init` step drops in a self-signed placeholder
certificate so nginx can start immediately even with no DNS/domain pointed
here yet — reach it at `https://localhost/` (expect a browser certificate
warning; that's the self-signed placeholder, not a bug) or by name with:

```bash
curl -k https://localhost/ -H "Host: ${DOMAIN:-sec.digitalwitch.online}"
curl -k https://localhost/api/health -H "Host: ${DOMAIN:-sec.digitalwitch.online}"
```

#### Getting a real TLS certificate

Once this stack is actually deployed on a host that `$DOMAIN`'s DNS record
points at, with ports 80/443 reachable from the public internet, run:

```bash
./init-letsencrypt.sh
```

once to swap the self-signed placeholder for a real Let's Encrypt
certificate. The `certbot` service then keeps it renewed automatically. This
step cannot succeed from a machine the domain doesn't actually point at —
Let's Encrypt validates ownership by reaching `$DOMAIN` over the internet.
