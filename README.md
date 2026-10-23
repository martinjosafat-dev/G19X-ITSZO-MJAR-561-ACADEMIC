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
├── core/       # Configuración y componentes compartidos
├── db/         # Motor y sesiones de base de datos
├── models/     # Modelos SQLAlchemy y esquemas Pydantic
└── services/   # Lógica de negocio e integración con Gemini

frontend/src/
├── pages/      # Pantallas de registro, chat y evaluación
└── services/   # Cliente HTTP y servicios de la API
```

## Prerrequisitos

- Docker Desktop con Docker Compose habilitado.
- Una API key de Google Gemini, disponible desde [Google AI Studio](https://aistudio.google.com/app/apikey).
- Node.js y npm para ejecutar el frontend localmente.

## Levantar el proyecto localmente

1. Clona el repositorio y abre una terminal en la carpeta raíz.

2. Crea o actualiza el archivo `.env` en esa carpeta con tu clave de Gemini y una contraseña para PostgreSQL:

   ```dotenv
   GOOGLE_API_KEY=tu_api_key_de_google
   POSTGRES_PASSWORD=una_contraseña_segura
   ```

   No publiques ni compartas el archivo `.env`; está excluido del control de versiones. Usa una contraseña compatible con una URL de conexión (sin caracteres reservados como `@`, `/` o `:`).

3. Construye e inicia el backend y PostgreSQL:

   ```bash
   docker-compose up -d --build
   ```

   Si tu instalación usa el plugin moderno de Compose, el comando equivalente es:

   ```bash
   docker compose up -d --build
   ```

4. Comprueba que la API esté activa en `http://localhost:8080/health`. La documentación interactiva de FastAPI está en `http://localhost:8080/docs`. PostgreSQL está publicado en el puerto `5433`.

5. En otra terminal, inicia el frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Antes de iniciarlo, crea `frontend/.env` con la URL de la API:

   ```dotenv
   VITE_API_URL=http://localhost:8080/api/v1
   ```

   Abre la URL local que indique Vite en la terminal (normalmente `http://localhost:5173`).

Para detener los servicios de Docker desde la raíz:

```bash
docker-compose down
```

Los datos de PostgreSQL se conservan en el volumen Docker `postgres_data`.
