"""Uvicorn entrypoint for the payment processor service."""

import uvicorn

from app.shared.config import get_settings


def main() -> None:
    """Run the ASGI server."""
    settings = get_settings()
    uvicorn.run(
        "app.interfaces.api:create_app",
        factory=True,
        host="0.0.0.0",
        port=settings.python_service_port,
        log_level=settings.log_level,
    )


if __name__ == "__main__":
    main()
