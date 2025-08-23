# Usa Python oficial
FROM python:3.13.7-slim

# Variables de entorno para evitar pyc y asegurar stdout
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Crear carpeta app
WORKDIR /app

# Copiar requirements primero (para cacheo en builds)
COPY backend/requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY backend/ ./backend

# Exponer puerto
EXPOSE 8000

# Comando para arrancar FastAPI con uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

