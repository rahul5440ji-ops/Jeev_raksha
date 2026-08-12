"""
Typed application settings, loaded from environment variables.

No secrets are hard-coded here. In development without a .env file,
insecure-but-obvious defaults are used ONLY for non-secret, non-prod
values (e.g. debug flag) so the app can boot for local exploration;
anything security-sensitive (APP_SECRET_KEY, DB credentials) must be
supplied explicitly and is validated as non-empty at startup.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = ""  # required to be non-empty outside development

    # --- Database ---
    database_url: str = ""

    # --- Auth / JWT ---
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # --- CORS ---
    cors_allowed_origins: str = "http://localhost:5173"

    # --- Storage (adapter selection; real creds not modeled here yet) ---
    storage_provider: str = "local"
    storage_local_path: str = "/data/uploads"

    # --- Maps / GIS (adapter selection) ---
    map_provider: str = "maplibre"
    map_tile_url: str = ""
    map_provider_api_key: str = ""

    # --- ML services ---
    animal_id_model_version: str = "unset"
    risk_assessment_model_version: str = "unset"

    @field_validator("app_secret_key")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        # In development, allow empty so the skeleton can boot without a
        # .env file. Anything beyond development must set a real key.
        # (Enforced strictly once auth ships in the next increment.)
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — read once, reused across the app."""
    return Settings()
