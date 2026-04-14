from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Practice Tracker API"
    APP_ENV: str = "dev"
    APP_DEBUG: bool = True

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "practice_tracker"
    DB_USER: str = "practice_user"
    DB_PASSWORD: str = "practice_password"

    DATABASE_URL: str = (
        "postgresql+psycopg://practice_user:practice_password@localhost:5432/practice_tracker"
    )

    SECRET_KEY: str = "change_me_to_long_random_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
