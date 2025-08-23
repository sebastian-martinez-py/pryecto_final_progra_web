# Usa Python slim
FROM python:3.13.7-slim

# Carpeta de trabajo en el contenedor
WORKDIR /app

# Copiamos requirements primero para aprovechar cache
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el backend
COPY backend/ ./backend/

# Exponemos puerto
EXPOSE 8000

# Ejecutamos FastAPI (backend.main:app es correcto ahora)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
