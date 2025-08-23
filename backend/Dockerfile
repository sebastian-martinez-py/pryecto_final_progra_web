# backend/Dockerfile
FROM python:3.13.7-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 1) Copia e instala dependencias (el archivo está en backend/)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Copia TODO el backend (el contexto del build es ./backend)
COPY . /app/

# 3) Opcional
ENV USE_APSCHEDULER=0

# 4) Arranque: main.py está en /app y hace imports absolutos (models, crud, etc.)
EXPOSE 8000
CMD ["uvicorn","backend.main:app","--host","0.0.0.0","--port","8000"]