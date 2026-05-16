"""FastAPI application factory and routes."""

from fastapi import FastAPI


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Payment Processor",
        description="Internal payment approval/rejection simulator",
        version="0.1.0",
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        """Health check for container orchestration."""
        return {"status": "ok"}

    return app
