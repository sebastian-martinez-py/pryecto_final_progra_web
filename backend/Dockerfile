# Backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependencias
COPY Backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código
COPY Backend/ /app/Backend/

# (Opcional) variables por defecto
ENV USE_APSCHEDULER=0

# Arranca desde la carpeta Backend y ejecuta main:app
WORKDIR /app/Backend
EXPOSE 8000
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
