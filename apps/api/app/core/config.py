from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://cyberlab:cyberlab@localhost:5432/cyberlab"
    environment: str = "development"

    # Dev-only default — every deployment must override this via the
    # SECRET_KEY env var. Tokens signed with a guessed/default key let an
    # attacker forge auth for any account, so this is a hard requirement
    # outside local development, not a nice-to-have.
    secret_key: str = "dev-only-insecure-secret-change-me"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Comma-separated list; only matters when the frontend and API are on
    # different origins (e.g. docker-compose.local.yml's :3000 -> :8000).
    # Behind the nginx compose base they share an origin and CORS never
    # triggers.
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # SMTP is the one transport that works with almost every provider (a
    # Gmail App Password for quick testing, Amazon SES's SMTP interface —
    # matching the blueprint's AWS choice — or SendGrid/Mailgun/Postmark),
    # so it's the default rather than a provider-specific API integration.
    # Leaving smtp_host unset keeps verification codes as a console log,
    # which is fine for local/dev use but not real delivery — see
    # app/core/email.py.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_from_email: str = "no-reply@cyberlab.local"


settings = Settings()
