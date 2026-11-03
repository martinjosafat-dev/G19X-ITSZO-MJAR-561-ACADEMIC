# Recorrido de revisión del MVP — PluriOne

Esta guía permite revisar el flujo completo de PluriOne con el backend, PostgreSQL y el frontend ya iniciados, y con las migraciones aplicadas. Abre el frontend en `http://localhost:5173`. El recorrido usa Gemini para responder en el chat y generar la evaluación; configura `GOOGLE_API_KEY` en el `.env` de la raíz antes de probar esas funciones.

Anota el identificador de entrevista que aparece en la URL al iniciar el chat. Lo necesitarás para verificar la entrevista completada.

## 1. Registro (MVP-REG)

1. Abre `http://localhost:5173/`.
2. Completa el formulario con datos de prueba:
   - **First Name:** `Ana`
   - **Last Name:** `Prueba`
   - **Email:** `ana.prueba+recorrido@example.com`
   - **Phone:** `+52 55 1234 5678` (opcional)
   - **Puesto al que aplicas:** `Analista de datos`
3. Pulsa **Iniciar entrevista**.
4. Comprueba que el navegador te lleva a `/chat/{id}`, donde `{id}` es el identificador asignado. Esa URL confirma que se creó la entrevista asociada al candidato.
5. Para comprobar el rechazo de correo repetido, vuelve a `http://localhost:5173/` y registra otro candidato usando exactamente `ana.prueba+recorrido@example.com` (puedes cambiar el nombre). Al enviar, debe mostrarse un error de correo ya registrado y no debe iniciarse una segunda entrevista para ese correo.

Usa un correo nuevo en cada ejecución del recorrido, o uno que no esté ya guardado en la base de datos.

## 2. Chat (MVP-CHAT)

1. Desde el registro exitoso, permanece en `/chat/{id}`. Si abriste otra página, vuelve a la URL de chat anotada en el paso anterior.
2. En **Escribe tu respuesta…**, escribe `Tengo experiencia analizando datos y creando reportes para apoyar decisiones de negocio.` y pulsa **Enviar**.
3. Comprueba que tu mensaje aparece en una burbuja y, tras el indicador **La IA está escribiendo…**, aparece una respuesta del entrevistador relacionada con el puesto de Analista de datos.
4. Envía al menos otra respuesta, por ejemplo: `Utilizo SQL y Python; primero valido la calidad de los datos y después presento los hallazgos con visualizaciones claras.` Comprueba que los turnos nuevos se agregan debajo de los anteriores.
5. No finalices todavía si quieres probar mensajes adicionales. La evaluación usa el transcript disponible al finalizar.

Las respuestas exactas varían según el modelo de IA; verifica que el turno del entrevistador no esté vacío y que el historial de la conversación permanezca visible.

## 3. Evaluación (MVP-EVAL)

1. En la pantalla del chat, pulsa **Finalizar Entrevista** y espera a que termine el procesamiento.
2. Comprueba que se abre `/evaluation/{id}` y se muestra un puntaje de 0 a 100, la sección **Observaciones** con retroalimentación y la nota que indica que el puntaje de IA es solo un apoyo para el equipo de selección.
3. Recarga la página de evaluación. El resultado debe volver a cargarse desde la entrevista guardada.
4. Para verificar que una entrevista completada no acepta más respuestas, abre directamente `http://localhost:5173/chat/{id}` usando el mismo ID. Escribe `Quiero agregar otra respuesta` y pulsa **Enviar**. La API debe rechazar el mensaje porque la entrevista ya no está en curso y la pantalla debe mostrar un error; no debe añadirse una nueva respuesta al transcript.

## 4. Panel del reclutador (MVP-REC)

1. Abre `http://localhost:5173/recruiter` en una pestaña o ventana privada donde no hayas ingresado una llave anteriormente. Sin llave, el panel debe mostrar **Llave de acceso del reclutador** y **Ingresa la llave para consultar las entrevistas**; no debe mostrar la tabla.
2. En la raíz del proyecto, consulta el valor configurado como `RECRUITER_API_KEY` en tu archivo `.env` local. No compartas ni publiques esa llave.
3. En el campo de llave del panel, introduce primero `llave-incorrecta-de-prueba` y pulsa **Continuar**. El servidor debe responder con 401; la interfaz debe indicar que la llave no es válida o expiró, borrar la llave de la sesión y volver a solicitarla.
4. Ingresa el valor correcto de `RECRUITER_API_KEY` y pulsa **Continuar**. Comprueba que la tabla muestra las entrevistas, incluido el candidato de este recorrido, su correo, puesto, estado, puntaje y fecha.
5. Pulsa el nombre del candidato. En `/recruiter/{id}`, comprueba que aparecen el puesto, estado y puntaje, además del transcript completo en orden y la retroalimentación generada.

El formulario del panel no envía una solicitud mientras no haya una llave ingresada. Para comprobar directamente que el endpoint también responde 401 cuando se omite el header, ejecuta desde PowerShell:

```powershell
curl.exe -i http://localhost:8080/api/v1/interviews/
```

La respuesta esperada es `401 Unauthorized`. Para probar el rechazo de una llave incorrecta directamente en la API:

```powershell
curl.exe -i -H "X-Recruiter-Key: llave-incorrecta-de-prueba" http://localhost:8080/api/v1/interviews/
```

La respuesta esperada también es `401 Unauthorized`.
