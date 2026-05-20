from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/smartspend"
    SECRET_KEY: str = "changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # M-Pesa Daraja (sandbox defaults)
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    MPESA_CALLBACK_URL: str = "https://your-ngrok-url.ngrok-free.app/api/mpesa/callback"

    class Config:
        env_file = ".env"


settings = Settings()
