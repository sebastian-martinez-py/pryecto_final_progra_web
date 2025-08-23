# Imagen base ligera
FROM python:3.13.7-slim

# Evitar pyc y logs bufferizados
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear usuario no root
RUN groupadd -g 10001 app && useradd -m -u 10001 -g app app

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY Backend/requirements.txt ./requirements.txt

# Instalar dependencias
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY Backend/ /app/

# Exponer puerto
EXPOSE 8000

# Comando de arranque
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
