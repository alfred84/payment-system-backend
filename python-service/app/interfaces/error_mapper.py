"""Map domain errors to HTTP responses."""

from fastapi import Request
from fastapi.responses import JSONResponse


def value_error_handler(_request: Request, exc: ValueError) -> JSONResponse:
    """
    Convert ``ValueError`` from domain validation into HTTP 422.

    Args:
        _request: Incoming request (unused).
        exc: Raised value error.

    Returns:
        JSON response with validation details.
    """
    return JSONResponse(
        status_code=422,
        content={
            "detail": [
                {
                    "type": "value_error",
                    "loc": ["body"],
                    "msg": str(exc),
                    "input": None,
                }
            ]
        },
    )
