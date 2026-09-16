from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://cyberlab:cyberlab@localhost:5432/cyberlab"
    environment: str = "development"


settings = Settings()
