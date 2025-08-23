FROM python:3.13.7-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias y instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código de la app
COPY . .

# Exponer puerto de FastAPI
EXPOSE 8000

# Ejecutar la app (ajusta main:app si tu entrypoint es distinto)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
