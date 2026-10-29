# PluriOne

PluriOne es un MVP HRTech para realizar entrevistas iniciales asistidas por inteligencia artificial. Los candidatos pueden registrarse, conversar con un entrevistador virtual y recibir una evaluación con puntaje y retroalimentación.

## Tecnologías principales

- **Backend:** Python, FastAPI y SQLAlchemy asíncrono.
- **Frontend:** React, TypeScript, Vite y Tailwind CSS.
- **Base de datos:** PostgreSQL.
- **IA conversacional:** LangChain, LangGraph y Google Gemini.
- **Contenedores:** Docker y Docker Compose.

## Arquitectura

El backend sigue principios de **Clean Architecture**, separando presentación, servicios de negocio y acceso a datos:

```text
backend/app/
├── api/        # Routers y endpoints HTTP
│   └── errors.py # Traducción de excepciones de negocio a HTTP
├── db/         # Motor y sesiones de base de datos
├── domain/     # Excepciones de negocio
├── models/     # Modelos SQLAlchemy y esquemas Pydantic
└── services/   # Lógica de negocio e integración con Gemini

frontend/src/
├── pages/      # Registro, chat, evaluación y panel de reclutador
└── services/   # Cliente HTTP y servicios de la API
```

## Prerrequisitos

- Docker Desktop con Docker Compose habilitado.
- Una API key de Google Gemini, disponible desde [Google AI Studio](https://aistudio.google.com/app/apikey).
- Node.js y npm para ejecutar el frontend localmente.

## Levantar el proyecto localmente

1. Clona el repositorio y abre una terminal en la carpeta raíz.

2. Copia el archivo de ejemplo de entorno y completa sus variables:

   ```powershell
   Copy-Item .env.example .env
   ```

   En `.env`, configura `GOOGLE_API_KEY`, `GOOGLE_GENAI_MODEL`, `POSTGRES_PASSWORD` y `RECRUITER_API_KEY`. Define una llave de reclutador larga y aleatoria; la ingresarás en el panel para consultar sus endpoints protegidos. No publiques el archivo `.env`. Usa una contraseña compatible con una URL de conexión (sin caracteres reservados como `@`, `/` o `:`).

3. Construye e inicia el backend y PostgreSQL:

   ```bash
   docker-compose up -d --build
   ```

   Si tu instalación usa el plugin moderno de Compose, el comando equivalente es:

   ```bash
   docker compose up -d --build
   ```

4. Comprueba que la API esté activa en `http://localhost:8080/health`. La documentación interactiva de FastAPI está en `http://localhost:8080/docs`. PostgreSQL está publicado en el puerto `5433`.

   Compose aplica las migraciones al iniciar la API. Para ejecutarlas manualmente:

   ```powershell
   docker compose exec api alembic upgrade head
   ```

   Las pruebas están en `backend/tests/`. Instala las dependencias de desarrollo y ejecútalas desde el contenedor:

   ```powershell
   docker compose exec api python -m pip install -r requirements-dev.txt
   docker compose exec api python -m pytest
   ```

5. En otra terminal, inicia el frontend:

   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   Set-Location frontend
   npm install
   npm run dev
   ```

   Abre la URL local que indique Vite en la terminal (normalmente `http://localhost:5173`).

   El panel del reclutador está disponible en `http://localhost:5173/recruiter`.

Para detener los servicios de Docker desde la raíz:

```bash
docker-compose down
```

Los datos de PostgreSQL se conservan en el volumen Docker `postgres_data`.

## Documentación

- [DOCUMENTATION.md](DOCUMENTATION.md)
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Alcance del MVP](docs/MVP.md)

## Uso de IA

GitHub Copilot se utilizó como asistente de código para apoyar la exploración, redacción y revisión de cambios. El equipo del proyecto conserva la responsabilidad sobre las decisiones técnicas, la validación y el código final.
