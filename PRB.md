# Project Reference Brief (PRB)
**Proyecto:** Plataforma de Entrevistas Asistidas mediante IA Conversacional
**Empresa:** PluriOne S.A. de C.V. (Develop Talent & Technology) 
**Metodología:** Scrum / Desarrollo por Sprints

## 1. Visión y Alcance del Proyecto
Desarrollo de una plataforma HRTech para automatizar entrevistas iniciales mediante agentes conversacionales de IA. El sistema deberá formular preguntas dinámicas, registrar respuestas en texto y voz, analizar competencias, generar transcripciones automáticas y elaborar reportes para los reclutadores.

## 2. Matriz Tecnológica
*   **Backend:** Python, FastAPI (Pydantic, SQLAlchemy/SQLModel).
*   **Frontend:** React.js.
*   **Motor de IA:** Azure OpenAI (LLMs), Whisper (Speech-to-Text), LangGraph (Orquestación de agentes y flujos)[cite: 1].
*   **Base de Datos:** PostgreSQL.
*   **DevOps e Infraestructura:** Docker, GitHub Actions (CI/CD).
*   **Análisis de Datos:** Power BI.

## 3. Arquitectura y Estándares de Codificación
*   **Arquitectura Limpia (Clean Architecture):** Separación estricta entre capa de presentación (Routers), lógica de negocio/IA (Servicios/Agentes) y acceso a datos (Repositorios).
*   **Asincronismo:** Uso obligatorio de `async/await` en FastAPI para operaciones de I/O, base de datos y llamadas a APIs externas (Azure/Whisper).
*   **Diseño de Agentes (LangGraph):** Los flujos de entrevista se modelarán como grafos de estado (StateGraphs) para preservar el contexto de la conversación del candidato.
*   **Idioma:** El código fuente (variables, funciones, tablas, endpoints) debe escribirse estrictamente en **inglés**. La documentación, comentarios explicativos y prompts del sistema deben redactarse en **español**.
*   **Tipado:** Uso estricto de Type Hints en Python y validación de datos con Pydantic.

## 4. Directrices de Ejecución para IA (Copilot)
*   Todo código generado debe alinearse con la arquitectura definida y los requerimientos del Sprint activo.
*   No generar monolitos; priorizar componentes modulares, reutilizables y testeables.
*   Asegurar el manejo de excepciones global y respuestas HTTP estandarizadas en el backend.