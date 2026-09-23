FROM python:3.11-slim

WORKDIR /app

# The docker CLI (client only, no daemon) — needed by the lab provisioner
# to start/stop per-session lab containers via the docker.sock mount from
# docker-compose.yml. Docker's official static binary rather than the apt
# docker.io package, which proved unreliable in at least one deployment —
# this way is self-contained once curl/ca-certificates are in place, no
# apt Docker repo involved. Only used when LAB_PROVISIONER=docker; a no-op
# otherwise.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz \
       | tar -xz -C /usr/local/bin --strip-components=1 docker/docker \
    && chmod +x /usr/local/bin/docker \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
