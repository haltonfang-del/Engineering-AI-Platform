from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str
    APP_VERSION: str
    APP_ENV: str

    HOST: str
    PORT: int

    # LLM (not used by local keyword search)
    DEFAULT_LLM_PROVIDER: str = ""
    DEFAULT_MODEL: str = ""

    # API Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Local engineering knowledge
    KNOWLEDGE_ROOT: str = "knowledge"
    KNOWLEDGE_INDEX_PATH: str = ".knowledge_index/index.json"
    ENABLE_LEGACY_CONVERSION: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
