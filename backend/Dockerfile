# syntax=docker/dockerfile:1

FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    VENV_PATH=/opt/venv

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv ${VENV_PATH}
ENV PATH="${VENV_PATH}/bin:${PATH}"

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VENV_PATH=/opt/venv \
    PYTHONPATH=/app
ENV PATH="${VENV_PATH}/bin:${PATH}"

# Copy virtualenv from builder
COPY --from=builder ${VENV_PATH} ${VENV_PATH}

WORKDIR /app
COPY backend/ /app/

EXPOSE 8000

# For running in Compose, DATABASE_URL should point to the service name `db`
# e.g. postgresql+asyncpg://amstar:amstar_password@db:5432/amstar

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

