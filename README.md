# PluriOne AI Interviews

Plataforma HRTech para apoyar las entrevistas iniciales mediante IA conversacional, registrar respuestas y transcripciones, analizar competencias y generar reportes para reclutadores.

## Arquitectura

El backend utiliza FastAPI y sigue una separación basada en Clean Architecture:

- `backend/app/api/`: routers y capa de presentación.
- `backend/app/core/`: configuración y componentes compartidos.
- `backend/app/services/`: lógica de negocio e integración con servicios de IA.
- `backend/app/models/`: modelos de datos.
- `backend/app/db/`: conexión y sesiones de base de datos.

PostgreSQL almacena los datos. SQLAlchemy se conecta de forma asíncrona; Alembic administra las migraciones. El frontend React se ubicará en `frontend/`.

## Iniciar el entorno

Para habilitar el chat de entrevistas con Google Gemini, crea un archivo `.env` en la raíz:

```dotenv
GOOGLE_API_KEY=<google-api-key>
```

No agregues credenciales reales al control de versiones. Sin esta variable, los servicios pueden iniciar, pero las solicitudes al chat no podrán invocar Gemini.

Desde la raíz del proyecto, construye las imágenes e inicia los servicios:

```bash
docker compose up --build -d
```

La API queda disponible en `http://localhost:8080` y PostgreSQL en `localhost:5433`. Para comprobar la API, abre `http://localhost:8080/health`.

Para detener los contenedores:

```bash
docker compose down
```

Los datos de PostgreSQL se conservan en el volumen Docker `postgres_data`.

Los endpoints de entrevistas están bajo `/api/v1`: `POST /interviews/` y `POST /interviews/{interview_id}/chat`.
