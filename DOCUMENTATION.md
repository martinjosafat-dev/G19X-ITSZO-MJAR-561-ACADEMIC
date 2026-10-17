# Historial de evolución técnica

## PluriOne — MVP de entrevistas asistidas por IA

Este documento registra las decisiones de arquitectura, integraciones y correcciones técnicas realizadas durante los sprints del MVP.

## Sprints 1 al 3: Backend y servicios de IA

### Sprint 1 — Modelo de datos y PostgreSQL

Se estableció PostgreSQL como almacenamiento relacional y se configuró SQLAlchemy con un motor y una fábrica de sesiones asíncronos. La URL de conexión se obtiene desde `DATABASE_URL`, evitando acoplar credenciales o direcciones de base de datos al código.

El modelo inicial separa candidatos y entrevistas. Los candidatos tienen identificador UUID, datos de contacto y fecha de creación; las entrevistas los referencian mediante una clave foránea y almacenan su transcript en JSONB. JSONB permite conservar de forma flexible los turnos de conversación que más adelante consume el orquestador de IA.

Se definió una clase declarativa compartida para centralizar metadata y facilitar la generación de migraciones con Alembic. Las migraciones hacen que la evolución del esquema sea repetible entre entornos.

### Sprint 2 — Endpoints base para candidatos

Se implementaron esquemas Pydantic para validar las solicitudes y representar las respuestas, un servicio de negocio para crear candidatos y un router de FastAPI para `POST /api/v1/candidates/`.

La separación entre endpoint y servicio mantiene la capa HTTP enfocada en validar y delegar, mientras la lógica de consulta y persistencia reside en el servicio. Antes de insertar, se verifica si el correo ya existe para responder con un error controlado en vez de depender únicamente de que la restricción única de PostgreSQL rechace la operación.

### Sprint 3 — Entrevistas conversacionales y decisión de proveedor

Se agregaron los modelos de entrada y respuesta para entrevistas y mensajes, la creación de entrevistas y el endpoint de chat. El historial completo se transforma a mensajes de usuario y asistente antes de solicitar la respuesta del entrevistador virtual; la nueva interacción se persiste en el transcript JSONB.

La primera integración se planteó con Azure OpenAI. Se cambió después a Google Gemini para reducir el costo de experimentación del MVP y utilizar una opción con capa gratuita. La integración se encapsuló en el servicio de IA y las credenciales se trasladaron a variables de entorno, preservando la separación entre la lógica de entrevistas y el proveedor concreto.

LangGraph se usa para orquestar el paso asíncrono de generación de respuesta, mientras LangChain adapta los mensajes y el cliente del proveedor. El ID de modelo se configura desde el entorno para poder reemplazarlo sin alterar rutas ni lógica de negocio.

## Sprints 4 al 6: Frontend y chat interactivo

### Sprint 4 — Inicialización del frontend

Se creó la aplicación React con TypeScript mediante Vite, junto con Tailwind CSS, React Router y Axios. Se limpió la pantalla de plantilla y se incorporó un cliente HTTP centralizado para que las llamadas de frontend compartan la URL base de la API.

La UI se ejecuta en desarrollo en un origen local separado del backend. Esta separación permite iterar con recarga rápida, pero hace necesario configurar explícitamente CORS en FastAPI.

### Sprint 5 — Registro y navegación

Se creó el formulario de registro del candidato y el servicio que encadena dos operaciones: registrar el candidato y, usando el ID devuelto, crear su entrevista. Cuando ambas operaciones terminan correctamente, React Router navega a la sala identificada por el ID de entrevista.

Los tipos TypeScript modelan los payloads y respuestas del backend. Los errores HTTP se convierten en mensajes visibles para que, por ejemplo, el candidato reciba una indicación entendible si el email ya está registrado.

### Sprint 6 — Interfaz de conversación

Se implementó una pantalla de chat con mensajes diferenciados por rol, un indicador de espera, envío asíncrono, manejo de fallos y desplazamiento automático hacia el último mensaje. El texto enviado se restaura si falla la petición para que el usuario pueda reintentar.

#### Incidencias técnicas resueltas

- **CORS y preflight:** los endpoints aceptan `OPTIONS` mediante el middleware de FastAPI. Se alinearon las rutas del cliente con las rutas declaradas por el backend, incluidas las diagonales finales, y se amplió la configuración CORS para los orígenes locales `localhost` y `127.0.0.1` con puertos de desarrollo. El prefijo `/api/v1` se define una sola vez en la URL base de Axios; los servicios solo agregan rutas relativas.
- **Formato de respuesta de Gemini:** la integración no siempre devuelve `AIMessage.content` como una cadena simple. Algunas respuestas llegan como bloques estructurados, por ejemplo `[{ "type": "text", "text": "..." }]`. El servicio ahora normaliza ambos formatos y concatena los bloques de texto antes de persistirlos y responder al frontend. Esto evita rechazar una respuesta válida y convertirla en un error HTTP 500.
- **Disponibilidad del modelo:** los logs revelaron respuestas `404 NOT_FOUND` para identificadores de modelos que ya no estaban disponibles para la cuenta utilizada. Se actualizó el modelo por defecto y se dejó configurable desde `GOOGLE_GENAI_MODEL`; el nombre efectivo debe corresponder a un modelo habilitado en Google AI Studio para la API key del entorno.

## Sprint 7: Cierre y evaluación

Al finalizar una entrevista, el servicio toma el transcript completo persistido y lo envía a Gemini con instrucciones para evaluar las respuestas del candidato en claridad, relevancia, ejemplos, resolución de problemas, habilidades técnicas y comunicación interpersonal.

La salida se valida con un esquema Pydantic estricto: `score` es un entero de 0 a 100 y `feedback` es texto no vacío. Se solicita salida estructurada tipo JSON y no se aceptan campos adicionales. Si la evaluación es válida, el servicio actualiza el estado a `completed`, guarda el puntaje en `ai_score` y persiste la retroalimentación en `evaluation_feedback`.

Alembic incorpora el cambio de esquema mediante una migración versionada, evitando depender de modificaciones manuales de la base de datos. El endpoint `POST /api/v1/interviews/{interview_id}/finish` devuelve el resultado generado; el endpoint de consulta de evaluación permite recuperarlo posteriormente.

En el frontend, el botón **Finalizar Entrevista** muestra un estado de carga, solicita la evaluación y navega a la pantalla de resultados pasando los datos recibidos. La pantalla presenta el puntaje y las observaciones; si se accede directamente o se recarga la página, consulta la evaluación guardada en la API.

## Flujo técnico resultante

```text
Candidato
  → React (registro y chat)
  → Axios / FastAPI
  → servicios de negocio
  → SQLAlchemy asíncrono / PostgreSQL
  → LangGraph y LangChain
  → Google Gemini
  → transcript y evaluación persistidos
  → pantalla de resultados
```

## Configuración operacional

- `DATABASE_URL`: conexión asíncrona de SQLAlchemy a PostgreSQL.
- `GOOGLE_API_KEY`: credencial del servicio Gemini; debe mantenerse fuera del control de versiones.
- `GOOGLE_GENAI_MODEL`: identificador de modelo elegido para la API key activa; Compose define un valor por defecto que puede sobrescribirse en el archivo `.env`.

El backend y PostgreSQL se ejecutan con Docker Compose. El frontend se puede iniciar localmente con Vite durante el desarrollo.
