# syntax=docker/dockerfile:1

FROM python:3.14-slim AS production

WORKDIR /app/python-service

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHON_SERVICE_PORT=8000

COPY python-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY python-service/app ./app/

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"

CMD ["python", "-m", "uvicorn", "app.interfaces.api:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
