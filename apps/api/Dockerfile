FROM python:3.11-slim

WORKDIR /app

# The docker CLI (client only, no daemon) — needed by the lab provisioner
# to start/stop per-session lab containers via the docker.sock mount from
# docker-compose.yml. Only used when LAB_PROVISIONER=docker; a no-op
# otherwise.
RUN apt-get update && apt-get install -y --no-install-recommends docker.io \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
