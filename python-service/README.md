# Python Payment Processor

Internal FastAPI microservice that simulates payment approval/rejection (80/20).

## Run locally

```bash
pip install -r requirements.txt -r requirements-dev.txt
PYTHON_SERVICE_PORT=8000 python -m app.main
```

## Tests

```bash
pytest --cov=app --cov-fail-under=75
ruff check .
ruff format --check .
lint-imports
```
