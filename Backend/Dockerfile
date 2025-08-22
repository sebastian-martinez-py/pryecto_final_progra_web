# Backend/Dockerfile
# Imagen base parcheada y explícita (bookworm)
FROM python:3.13.7-slim

# Buenas prácticas runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Actualiza paquetes del SO (mitiga CVEs del layer base)
RUN apt-get update \
 && apt-get -y upgrade \
 && rm -rf /var/lib/apt/lists/*

# (Opcional) crea usuario no-root
RUN groupadd -g 10001 app && useradd -m -u 10001 -g app app

WORKDIR /app

# Instala dependencias Python
# Usa --upgrade pip para tomar parches recientes
COPY Backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copia el código
COPY Backend/ /app/

EXPOSE 8000

# Ejecuta como usuario no-root
USER app

CMD ["uvicorn", "main:app", "--host","0.0.0.0","--port","8000"]
