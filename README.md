Proyecto Final – Programación Web

Adopta CR · Comunidad para adopción de perros y reporte de mascotas perdidas.

✨ Descripción

Aplicación web con:

Frontend estático (HTML/CSS/JS) servido por FastAPI.

API REST con CRUD de publicaciones (adoptables / perdidos).

Pipeline que normaliza datos a la tabla items_cleaned y genera backups.

MySQL como base de datos.

Integración externa con la API pública Dog CEO para generar fichas de adopción con imágenes aleatorias.

Docker Compose para levantar todo con un comando.

Swagger para documentación de la API.

🚀 Ejecución local (Docker Compose)

Requisitos: Docker Desktop / Docker Engine.

Clona el repositorio y abre la carpeta del proyecto.

Crea un archivo .env en la raíz con tu cadena de conexión (dentro de Docker, el host de MySQL es db):

DATABASE_URL=mysql+pymysql://root:<TU_PASSWORD>@db:3306/TrabajoFinal
USE_APSCHEDULER=0


Levanta los servicios:

docker compose up -d --build


Abre:

Frontend: http://localhost:8000/

Swagger: http://localhost:8000/docs

Si no ves los estilos, usa Ctrl+F5 (hard refresh).
Para reconstruir sin caché:
docker compose build --no-cache api && docker compose up -d api

🧱 Estructura de carpetas
backend/
 ├─ main.py
 ├─ database.py
 ├─ crud.py
 ├─ models.py
 ├─ schemas.py
 ├─ pipeline/
 │   ├─ run.py
 │   └─ flow.py            # (opcional: Prefect)
 └─ static/
     ├─ index.html
     ├─ css/
     │   └─ styles.css
     └─ js/
         └─ main.js
docker-compose.yml
backend/Dockerfile
.env  # (no commitear)

🔌 Endpoints principales
Método	Ruta	Descripción
GET	/api/items	Lista publicaciones RAW
POST	/api/items	Crea una publicación (title, description, image_url)
DELETE	/api/items/{id}	Elimina una publicación por id
GET	/api/cleaned	Lista publicaciones normalizadas
POST	/api/pipeline/run	Ejecuta manualmente el pipeline
GET	/	Sirve el index.html
GET	/docs	Documentación Swagger
Ejemplos rápidos (cURL)
# Crear (adoptable)
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"ADOPTA · Luna","description":"Contacto: Test | Tel: +506 8888-0000","image_url":"https://images.dog.ceo/breeds/husky/n02110185_1469.jpg"}'

# Listar RAW
curl http://localhost:8000/api/items

# Ejecutar pipeline
curl -X POST http://localhost:8000/api/pipeline/run

# Listar normalizados
curl http://localhost:8000/api/cleaned

🗃️ Modelo de datos

Tabla items (RAW):
id, title, description, image_url, created_at

Tabla items_cleaned (normalizada):
id, title, description, image_url, source_id, created_at

Las tablas se crean automáticamente al iniciar (via models.Base.metadata.create_all(...)).

🖥️ Frontend (vista en /)

Hero con imagen de perrito y botones de acción.

Panel “¿Quiénes somos?”.

Menú desplegable con acciones rápidas.

Formulario para reportar mascota perdida (nombre, zona, descripción, imagen, contacto).

Listas de Adoptables y Perdidos (ordenados por más recientes).

Modal de contacto para adopción.

Botón “Inventar perrito” que usa la API pública Dog CEO.

Los archivos estáticos deben referenciarse con rutas absolutas:
CSS: /static/css/styles.css • JS: /static/js/main.js

🧪 Pipeline

Objetivo: leer items, normalizar y persistir en items_cleaned, además de escribir un backup y un log.

Ejecutar manualmente:

curl -X POST http://localhost:8000/api/pipeline/run


Salida del pipeline:

backups/cleaned_<YYYYMMDD_HHMMSS>.json

logs/pipeline.log con métricas básicas (leídos / total).

(Opcional) Con Prefect (backend/pipeline/flow.py) puedes orquestar como flow.

⚙️ Variables de entorno

.env (no lo subas al repo):

DATABASE_URL=mysql+pymysql://root:<TU_PASSWORD>@db:3306/TrabajoFinal
USE_APSCHEDULER=0


docker-compose.yml define MySQL:

environment:
  MYSQL_ROOT_PASSWORD: <TU_PASSWORD>
  MYSQL_DATABASE: TrabajoFinal


Cambia <TU_PASSWORD> por una contraseña real y mantenla fuera del repositorio (usa secrets si publicas).

🐳 Docker / Compose

El docker-compose.yml levanta:

db: MySQL 8 (puerto host por defecto 3311:3306, ajusta si está en uso).

api: FastAPI en 0.0.0.0:8000.

Comandos útiles:

# Levantar todo
docker compose up -d --build

# Reconstruir solo API
docker compose build api && docker compose up -d api

# Reconstruir sin caché
docker compose build --no-cache api && docker compose up -d api

# Ver logs
docker compose logs -f api

☁️ Publicar imagen con GitHub Actions (opcional)

Crea Secrets en el repo:
DOCKERHUB_USERNAME y DOCKERHUB_TOKEN (token de Docker Hub).

Workflow .github/workflows/docker-publish.yml:

name: publish-backend
on:
  push:
    branches: [ "main" ]
    paths:
      - "backend/**"
      - ".github/workflows/docker-publish.yml"
jobs:
  build-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/trabajofinal-api:latest


Para usar la imagen publicada en Compose:

api:
  image: <tuuser>/trabajofinal-api:latest
  container_name: backend_api
  restart: always
  env_file: .env
  ports:
    - "8000:8000"
  depends_on:
    - db

🧰 Solución de problemas

Veo la página “vieja” o sin estilos

Reconstruye sin caché:
docker compose build --no-cache api && docker compose up -d api

Abre directamente:
http://localhost:8000/static/css/styles.css y http://localhost:8000/static/js/main.js.
Si sale Not Found, revisa rutas y copia de archivos al contenedor.

Conflicto de puertos MySQL
Cambia el mapeo del host: 3311:3306 → 3312:3306.

Dog CEO falla
A veces tarda; intenta nuevamente o revisa la pestaña Network del navegador.

CORS
El proyecto habilita CORS con allow_origins=["*"] en main.py.

✅ Checklist (requisitos)

 Frontend que consume API propia y API externa (Dog CEO).

 CRUD básico (/api/items, DELETE /api/items/{id}).

 Proceso ETL/pipeline de normalización y backup.

 Documentación Swagger en /docs.

 Docker Compose con MySQL + FastAPI.

 Variables de entorno y configuración separada.

 Interfaz con menú, formulario, tarjetas y modal de contacto.

📝 Licencia

Proyecto académico. Úsalo libremente con fines educativos.
