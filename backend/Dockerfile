# backend/Dockerfile
FROM python:3.13-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias desde backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la app
COPY backend/ ./backend

# Exponer puerto de FastAPI
EXPOSE 8000

# Ejecutar la app (ajusta backend.main:app si tu entrypoint tiene otro nombre)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
