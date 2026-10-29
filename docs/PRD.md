# Product Requirements Document (PRD) — PluriOne

## 1. Visión del producto

PluriOne es una plataforma HRTech para realizar entrevistas iniciales de trabajo mediante una conversación textual asistida por inteligencia artificial. El candidato participa en una entrevista guiada; el sistema guarda el historial y genera una evaluación estructurada para apoyar la revisión del equipo de selección.

El producto facilita la recopilación y revisión de información, pero no toma decisiones de contratación. La evaluación automatizada es orientativa y debe ser revisada por una persona.

## 2. Problema

Las entrevistas iniciales requieren tiempo del equipo de selección y sus respuestas pueden quedar dispersas o ser difíciles de revisar de manera consistente. PluriOne centraliza el registro, la conversación, el historial y una evaluación automatizada para facilitar la revisión humana, sin reemplazar el criterio del reclutador.

## 3. Objetivos del producto

- Permitir que un candidato se registre e inicie una entrevista desde la aplicación web.
- Mantener una conversación textual en español que considere los turnos previos.
- Persistir el transcript de la entrevista y su resultado.
- Generar un puntaje de 0 a 100 y retroalimentación constructiva al finalizar.
- Permitir al reclutador consultar entrevistas, estado, puntaje y transcript desde un panel.

## 4. Tipos de usuarios

### 4.1 Candidato

Persona que responde preguntas de una entrevista inicial para una oportunidad laboral.

**Necesidades**

- Iniciar la entrevista con un proceso de registro claro.
- Responder en texto y recibir preguntas relevantes con contexto.
- Poder identificar errores y reintentar cuando una solicitud no se completa.
- Saber que interactúa con una IA y que la evaluación no constituye por sí sola una decisión laboral.

**Acciones principales**

- Proporcionar nombre, apellido, correo electrónico y teléfono opcional.
- Iniciar una entrevista asociada a su registro.
- Enviar mensajes, recibir respuestas y finalizar la entrevista.
- Consultar el resultado de evaluación presentado al concluir.

### 4.2 Reclutador

Integrante del equipo de selección que revisa entrevistas y resultados como apoyo a su evaluación profesional.

**Necesidades**

- Consultar la lista de entrevistas con nombre, correo, estado y puntaje del candidato.
- Abrir una entrevista y revisar su transcript completo.
- Usar la evaluación de IA como insumo y conservar la decisión final bajo responsabilidad humana.

**Límite actual**

La aplicación cuenta con un panel en `/recruiter` y endpoints protegidos mediante una llave compartida. Todavía no implementa cuentas, permisos individuales ni autorización por organización. El panel no debe exponerse públicamente ni utilizarse con datos reales hasta incorporar esos controles y transporte HTTPS.

## 5. Requisitos funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | El sistema permite registrar un candidato con nombre, apellido, correo y teléfono opcional. | MVP |
| RF-02 | El sistema valida los campos requeridos y rechaza el registro de un correo electrónico duplicado. | MVP |
| RF-03 | El sistema crea una entrevista asociada a un candidato existente y la inicia en estado `in_progress`. | MVP |
| RF-04 | El candidato puede enviar mensajes de texto a una entrevista en curso y recibir una respuesta contextual del entrevistador de IA. | MVP |
| RF-05 | El sistema persiste los mensajes de candidato y entrevistador en orden dentro del transcript. | MVP |
| RF-06 | El sistema rechaza mensajes para entrevistas inexistentes o que no estén en curso y comunica un error entendible. | MVP |
| RF-07 | El candidato puede finalizar una entrevista en curso para solicitar su evaluación. | MVP |
| RF-08 | La evaluación contiene un puntaje entero entre 0 y 100, inclusive, y retroalimentación no vacía, generados a partir del transcript. | MVP |
| RF-09 | Tras una evaluación válida, el sistema persiste el puntaje, la retroalimentación y el estado `completed`. | MVP |
| RF-10 | El sistema permite consultar una evaluación persistida incluso después de recargar la página. | MVP |
| RF-11 | El panel del reclutador muestra el nombre, correo, estado y puntaje de cada entrevista; si no hay puntaje, indica que está pendiente. | MVP |
| RF-12 | Al seleccionar una entrevista en el panel, el reclutador puede consultar todos los mensajes del transcript en orden e identificar su emisor. | MVP |
| RF-13 | El sistema comunica errores de validación, estado y disponibilidad del proveedor de IA sin presentar fallos como operaciones exitosas. | MVP |
| RF-14 | El reclutador puede autenticarse y solo consultar entrevistas autorizadas para su organización. | Siguiente fase |
| RF-15 | El sistema permite configurar vacantes, competencias, rúbricas y guías de entrevista. | Siguiente fase |
| RF-16 | El sistema admite entrevistas por voz y transcripción automática de audio. | Siguiente fase |
| RF-17 | El sistema ofrece reportes agregados e integraciones con ATS y herramientas de analítica. | Siguiente fase |

## 6. Criterios de aceptación

### 6.1 Registro y creación de entrevista

- **CA-01:** Dado un formulario válido, cuando el candidato lo envía, entonces el sistema crea el candidato y una entrevista asociada en estado `in_progress`.
- **CA-02:** Dado un correo ya registrado, cuando se intenta crear otro candidato con ese correo, entonces la operación se rechaza y no crea un duplicado.
- **CA-03:** Dado un formulario con campos obligatorios inválidos, cuando se envía, entonces el sistema devuelve errores de validación y no inicia una entrevista incompleta.

### 6.2 Chat

- **CA-04:** Dada una entrevista existente en estado `in_progress` y un mensaje no vacío, cuando el candidato envía el mensaje, entonces recibe una respuesta no vacía.
- **CA-05:** La respuesta se genera con el historial previo y el mensaje actual; el contexto de la conversación se conserva entre turnos.
- **CA-06:** En el flujo normal, el entrevistador responde en español y formula como máximo una pregunta relevante por turno.
- **CA-07:** Tras una solicitud exitosa, el transcript recuperado contiene primero el mensaje del candidato y después la respuesta del entrevistador, con sus roles identificables.
- **CA-08:** Si el identificador de entrevista no existe, el endpoint devuelve un error de recurso no encontrado y no modifica datos.
- **CA-09:** Si la entrevista no está en curso, el endpoint rechaza el mensaje con un error de conflicto y no añade turnos.
- **CA-10:** Si el proveedor de IA falla, el usuario recibe un error visible; la interfaz conserva el texto para reintento y el sistema no persiste una respuesta ficticia.

### 6.3 Evaluación con IA

- **CA-11:** Al finalizar una entrevista con transcript, el sistema solicita una evaluación basada en el historial completo y en las respuestas del candidato.
- **CA-12:** El sistema solo acepta una evaluación con puntaje entero entre 0 y 100, inclusive, y retroalimentación no vacía.
- **CA-13:** Si la generación o validación de la evaluación falla, el sistema informa el error, no guarda un resultado parcial y no marca la entrevista como completada.
- **CA-14:** Si la evaluación es válida, el sistema persiste el resultado, cambia el estado a `completed` y muestra el puntaje y la retroalimentación.
- **CA-15:** Al volver a consultar la evaluación de una entrevista completada, el resultado coincide con el valor persistido.
- **CA-16:** Una nueva solicitud de finalización para una entrevista ya completada devuelve el resultado persistido y no lo reemplaza silenciosamente.
- **CA-17:** La interfaz presenta el resultado como apoyo para revisión humana, no como una recomendación automática de contratación o rechazo.

### 6.4 Panel del reclutador

- **CA-18:** Al abrir `/recruiter`, el panel consulta el listado y muestra nombre, correo, estado y puntaje de cada entrevista.
- **CA-19:** Si no hay entrevistas, el panel muestra un estado vacío; mientras consulta datos, muestra un indicador de carga; si falla la solicitud, presenta un mensaje de error.
- **CA-20:** Al seleccionar una fila, el panel solicita el transcript de esa entrevista y muestra todos sus turnos, en orden, identificando candidato y entrevistador de IA.
- **CA-21:** Si la entrevista no tiene mensajes, el panel informa que el historial está vacío; si no se puede recuperar, muestra un error en vez de un transcript de éxito ficticio.

## 7. Requisitos no funcionales y principios

- **Privacidad y seguridad:** nombres, correos, transcripts y evaluaciones son datos sensibles. Se requiere autenticación y autorización antes de utilizar el panel con datos reales fuera de un entorno controlado.
- **Transparencia:** se debe informar al candidato que está conversando con IA y que la evaluación es automatizada.
- **Supervisión humana:** no se deben tomar decisiones laborales únicamente con base en el puntaje generado.
- **Calidad de datos:** las solicitudes y respuestas estructuradas deben validarse antes de persistirlas o mostrarlas.
- **Tolerancia a fallos:** los errores del proveedor no deben crear estados o resultados de éxito falsos.
- **Mantenibilidad:** la lógica de negocio, las interfaces HTTP, la persistencia y la integración de IA deben mantenerse separadas.

## 8. Métricas propuestas

La instrumentación y metas numéricas quedan pendientes. Se proponen estas métricas para validación futura:

- Porcentaje de entrevistas iniciadas que llegan a completarse.
- Tasa de errores de chat y evaluación.
- Tiempo de finalización de entrevista y latencia de respuesta.
- Porcentaje de evaluaciones que cumplen el esquema de salida.
- Satisfacción de candidatos y utilidad percibida por reclutadores.

## 9. Riesgos y pendientes

- El desempeño depende de la disponibilidad y calidad del proveedor y del modelo de IA.
- Un puntaje válido sintácticamente no demuestra que la evaluación sea justa, exacta o libre de sesgo.
- El panel actual usa una llave compartida y no implementa cuentas, permisos individuales ni autorización por organización; controles más completos y HTTPS son requisito previo para su uso con datos reales.
- Se deben definir consentimiento, aviso de privacidad, retención y eliminación de datos.
- Se deben acordar rúbricas y mecanismos de revisión antes de usar la evaluación para decisiones operativas.
