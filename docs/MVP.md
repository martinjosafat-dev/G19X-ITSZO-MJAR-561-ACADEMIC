# Alcance del MVP — PluriOne

## 1. Propósito

Validar el flujo de entrevista inicial asistida por IA, desde el registro del candidato hasta la revisión del resultado y el transcript por el reclutador. El MVP no toma decisiones laborales automáticas.

## 2. Usuarios

- **Candidato:** se registra, responde preguntas por texto y solicita la evaluación de su entrevista.
- **Reclutador:** consulta entrevistas, puntajes y transcripts desde el panel web. El panel actual no incluye autenticación ni autorización y debe limitarse a demostraciones controladas.

## 3. Incluido

- Registro de candidato y creación de una entrevista asociada.
- Validación de campos y rechazo de correos duplicados.
- Chat textual en español con contexto de turnos anteriores y persistencia del transcript.
- Finalización de entrevista y evaluación con IA, puntaje de 0 a 100 y retroalimentación.
- Consulta posterior del resultado persistido.
- Panel de reclutador con nombre, correo, estado, puntaje y transcript de cada entrevista.
- Estados de carga, ausencia de datos y errores visibles en la interfaz.

## 4. Fuera del alcance

- Entrevistas por voz, reconocimiento de voz, transcripción de audio o análisis de video.
- Power BI, tableros analíticos e informes agregados.
- Integraciones con ATS, calendarios, correo o mensajería.
- Administración de vacantes, configuración de competencias, rúbricas o plantillas.
- Autenticación, cuentas, roles y autorización para reclutadores.
- Uso del panel con datos reales o su publicación abierta hasta implementar controles de acceso y privacidad.
- Recomendaciones automáticas para avanzar, rechazar o contratar candidatos.
- Garantías de imparcialidad, ausencia de sesgo o validez predictiva de la evaluación.

## 5. Criterios de aceptación

### 5.1 Registro

- **MVP-REG-01:** Dado un formulario válido, al enviarlo, el sistema crea un candidato y una entrevista relacionada en estado `in_progress`.
- **MVP-REG-02:** Dado un correo electrónico ya registrado, el sistema rechaza el duplicado y no crea un segundo candidato.
- **MVP-REG-03:** Si faltan campos requeridos o no pasan la validación, el sistema muestra el error y no crea una entrevista incompleta.

### 5.2 Chat

- **MVP-CHAT-01:** Para una entrevista existente y en curso, un mensaje no vacío obtiene una respuesta no vacía del entrevistador IA.
- **MVP-CHAT-02:** Cada respuesta considera el transcript previo; el historial no se reinicia entre mensajes.
- **MVP-CHAT-03:** En el flujo normal, el entrevistador responde en español y formula como máximo una pregunta relevante por turno.
- **MVP-CHAT-04:** Tras una solicitud exitosa, el transcript contiene el mensaje del candidato y la respuesta de IA en ese orden, con emisor identificable.
- **MVP-CHAT-05:** Una entrevista inexistente o no activa produce un error comprensible y no agrega mensajes.
- **MVP-CHAT-06:** Si falla el proveedor, la interfaz informa el problema, conserva el texto para reintento y el sistema no persiste una respuesta ficticia.

### 5.3 Evaluación con IA

- **MVP-EVAL-01:** Al finalizar una entrevista con historial, la evaluación usa el transcript completo y las respuestas del candidato.
- **MVP-EVAL-02:** El sistema acepta únicamente un puntaje entero en el rango inclusivo de 0 a 100 y retroalimentación no vacía.
- **MVP-EVAL-03:** Si el proveedor falla o la salida no es válida, el sistema muestra un error, no persiste una evaluación parcial y no cambia el estado a `completed`.
- **MVP-EVAL-04:** Si la evaluación es válida, el sistema persiste puntaje, retroalimentación y estado `completed`, y la interfaz muestra el resultado.
- **MVP-EVAL-05:** Una consulta posterior, incluso después de recargar la página, recupera el resultado persistido sin sobrescribirlo silenciosamente.

### 5.4 Panel de reclutador

- **MVP-REC-01:** Al abrir el panel, se muestra una tabla con candidato, correo, estado y puntaje; si no hay puntaje se indica que está pendiente.
- **MVP-REC-02:** Al seleccionar una entrevista, se carga y muestra su transcript completo en orden, identificando candidato y entrevistador IA.
- **MVP-REC-03:** El panel presenta estados diferenciados de carga, lista vacía y error de consulta.
- **MVP-REC-04:** El panel se usa solo en un entorno controlado hasta implementar autenticación, autorización y controles de privacidad adecuados.

## 6. Límites y supuestos

- La entrevista inicial es textual y está orientada al español.
- La calidad de las respuestas y evaluaciones depende del proveedor y del modelo configurado.
- La evaluación es un insumo de apoyo y no una decisión de contratación.
- No se definen metas de latencia, disponibilidad o conversión hasta contar con mediciones de uso.
