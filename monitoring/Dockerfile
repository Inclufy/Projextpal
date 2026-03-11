FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psutil and Docker SDK
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/monitoring/

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

CMD ["python", "-m", "monitoring.agent", "--daemon", "--log-file", "/app/data/monitor.log"]
