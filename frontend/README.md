# Frontend de PluriOne

Interfaz web de PluriOne construida con React, TypeScript, Vite y Tailwind CSS.

## Pantallas

- **Registro (`/`):** captura los datos del candidato e inicia una entrevista.
- **Chat (`/chat/:interviewId`):** conversa por texto con el entrevistador de IA y permite finalizar la entrevista.
- **Evaluación (`/evaluation/:interviewId`):** muestra el puntaje y la retroalimentación de una entrevista completada.
- **Panel de reclutador (`/recruiter` y `/dashboard`):** muestra el listado de entrevistas con estado, puntaje y fecha.
- **Detalle del reclutador (`/recruiter/:interviewId`):** muestra datos del candidato, retroalimentación y transcript completo.

El panel no cuenta actualmente con autenticación ni autorización; úsalo solo en un entorno controlado y sin datos personales reales.

## Requisitos

- Node.js y npm.
- API FastAPI en ejecución. La URL local por defecto es `http://localhost:8080`.

## Configuración

Desde la raíz del repositorio, crea el archivo local a partir de la plantilla:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Configura `frontend/.env` con la URL base de la API, incluido el prefijo `/api/v1`:

```dotenv
VITE_API_URL=http://localhost:8080/api/v1
```

Vite expone variables con prefijo `VITE_` al código del navegador; no guardes secretos en este archivo.

## Instalación y desarrollo

```powershell
Set-Location frontend
npm install
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://localhost:5173`.

## Verificación y build

```powershell
npm run lint
npm run build
```
