# Prompt Engineering System — Harem AI

## Overview
Este documento describe en detalle el sistema de prompting (prompt engineering) de Harem AI, incluyendo el flujo de datos, los archivos involucrados, la arquitectura modular PromptBuilder, el Critique Agent y los prompts exactos utilizados para interactuar con el LLM (OpenAI). Sirve como referencia para desarrolladores y para futuras mejoras.

---

## 1. Arquitectura General

### **Frontend**
- El usuario envía un mensaje y/o imágenes.
- El usuario selecciona explícitamente el tipo de tarea (`intent`) y la etapa de la conversación (`stage`) mediante dos dropdowns en la UI.
- El usuario puede seleccionar su idioma preferido (`preferredLanguage`) y su estilo de Simp preferido (`simpPreference`) en la sección de preferencias.
- El historial de mensajes se serializa y se envía junto con el mensaje, imágenes, `intent`, `stage`, `preferredLanguage` y `simpPreference` al backend.
- El endpoint `/analyze` del backend recibe estos datos.

### **Backend**
- El controlador `analyzeController.ts` orquesta el flujo:
  - Parsea historial, mensaje, imágenes, `intent`, `stage`, `preferredLanguage` y `simpPreference`.
  - Guarda el mensaje y las imágenes en la base de datos y storage.
  - Construye los prompts para el LLM usando el sistema **PromptBuilder** centralizado:
    - **System Prompt**: instrucciones base para el modelo, cargadas desde un archivo `.txt` editable.
    - **User Prompt**: contexto del usuario (historial, preferencias, mensaje, descripciones de imágenes, y ahora también `intent`, `stage`, `preferredLanguage`, `simpPreference` como comentario inline).
    - **Few-Shot Prompt**: ejemplos de conversación dinámicos según el modo y etapa.
  - Llama al servicio `OpenAIService` para enviar los prompts y recibir la respuesta.
  - **Critique Agent**: toda respuesta generada por el LLM pasa por el Critique Agent antes de enviarse al usuario o guardarse en la base de datos.
  - Hace stream de la respuesta al frontend y la guarda en la base de datos.

---

## 2. SimpPreference (Estilo de Simp)

### ¿Qué es?
- **SimpPreference** es la preferencia del usuario sobre el estilo de Simp, que puede ser:
  - `auto`: la AI decide el tono óptimo según el contexto.
  - `low`: tono frío/confidente.
  - `neutral`: tono balanceado, natural.
  - `high`: tono halagador, intenso.
- El LLM infiere el nivel de "simp" adecuado para cada mensaje basándose en la preferencia y el contexto, **no existe un campo separado de simpLevel**.

### Flujo
- El usuario establece una preferencia base (`simpPreference`) en sus preferencias.
- El valor se guarda en la columna `simp_preference` de la tabla `profiles` en la base de datos.
- El backend recupera este valor y lo incluye en el prompt enviado al LLM.
- El LLM ajusta el tono de la respuesta según la preferencia y el contexto.

### Ejemplo de UI
```jsx
<label className="block text-sm font-medium text-gray-700">
  Preferred Simp Style
</label>
<select
  value={simpPreference}
  onChange={(e) => setSimpPreference(e.target.value)}
  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
>
  <option value="auto">Let AI decide what's best (recommended)</option>
  <option value="low">Stay confident & cold</option>
  <option value="neutral">Balanced & playful</option>
  <option value="high">Flirty & generous</option>
</select>
```

---

## 3. Estructura de Carpetas y Archivos Clave

```
backend/
  prompt-builder/
    ├── index.ts                # Entry point: buildFullPrompt y utilidades
    ├── buildSystemPrompt.ts    # Carga el prompt de sistema desde .txt
    ├── buildUserPrompt.ts      # Formatea el prompt de usuario (incluye intent, stage, idioma, simpPreference)
    ├── buildFewShotPrompt.ts   # Carga ejemplos few-shot dinámicamente
    ├── runCritiqueAgent.ts     # Ejecuta el Critique Agent
    ├── types.ts                # Tipos comunes para los prompts (incluye simpPreference)
  prompts/
    ├── systemPrompt.txt        # Prompt de sistema (editable, ahora con sección SimpPreference)
    ├── critiqueAgentPrompt.txt # Prompt del Critique Agent
    ├── nicknamePrompts.ts      # Prompts legacy para apodos y descripciones de imagen
    ├── userPrompt.ts           # Prompt legacy de usuario (migrado)
    ├── systemPrompt.ts         # Prompt legacy de sistema (migrado)
  fewshots/
    ├── ReEngage-Continue.md    # Ejemplo few-shot para modo/etapa
  controllers/
    ├── analyzeController.ts    # Orquestador del flujo de prompting
  services/
    ├── openaiService.ts        # Servicio que interactúa con OpenAI
frontend/src/components/
  ├── UploadComponent.jsx       # Formulario con dropdowns para intent y stage
  ├── UserPreferences.jsx       # Preferencias de usuario (ahora incluye idioma y simpPreference)
frontend/src/utils/
  ├── messageUtils.js           # Serialización del historial de mensajes
frontend/src/services/
  ├── messageService.js         # Envío de mensajes y contexto al backend
```

---

## 4. Flujo UI → Backend → PromptBuilder → Critique Agent

1. El usuario selecciona el tipo de tarea, la etapa de la conversación, el idioma y la preferencia de Simp en la UI. Cuando envía un mensaje, el payload incluye explícitamente estos campos.
2. El backend recibe estos campos y los pasa a PromptBuilder. El user prompt generado incluye un comentario inline al inicio:
   ```
   // Intent: <IntentMode>, Stage: <Stage>, Language: <preferredLanguage>, SimpPreference: <simpPreference>
   ```
3. El LLM genera una respuesta.
4. **El Critique Agent revisa SIEMPRE la respuesta antes de enviarla al usuario o guardarla.**
5. Solo la versión revisada/corregida llega al usuario y se almacena.

---

## 5. Construcción Modular de Prompts

### **A. System Prompt**
- Se carga desde `backend/prompts/systemPrompt.txt` usando `buildSystemPrompt()`.
- Es editable por cualquier desarrollador y versionable.
- Incluye ahora la sección:
  - 11. ATTITUDE CONTROL – SIMP PREFERENCE
- Ejemplo de fragmento:

```
11. ATTITUDE CONTROL – SIMP PREFERENCE
• You receive a SimpPreference field from the user:
  – "auto" → Use your best judgment to select the appropriate tone (from cold/detached to overly eager/flattering) based on context and goals.
  – "low" → Stay cold or confident, avoid being overly flattering.
  – "neutral" → Stay balanced and natural.
  – "high" → Be flirty, intense, and generous with compliments.
• SimpPreference affects tone, praise, eagerness, and emotional vulnerability.
• Choose the optimal tone unless constrained by the user's preference.
```

### **B. User Prompt**
- Se construye dinámicamente con `buildUserPrompt(input: PromptInput)`.
- Incluye `intent`, `stage`, `preferredLanguage` y `simpPreference` como comentario inline al inicio.
- Estructura:

```
// Intent: <IntentMode>, Stage: <Stage>, Language: <preferredLanguage>, SimpPreference: <simpPreference>

User Preferences:
<preferencias del usuario>

Chat History:
<historial serializado>

Latest Message:
<mensaje actual>

[Image Description: <descripción de imagen>]
```
- Solo se incluyen las secciones que tengan datos.

### **C. Few-Shot Prompt**
- Se carga dinámicamente con `buildFewShotPrompt(input: PromptInput)` desde archivos en `backend/fewshots/`.
- El archivo debe llamarse `{IntentMode}-{Stage}.md` (ej: `ReEngage-Continue.md`).

### **D. Prompt Final**
- Se construye con `buildFullPrompt(input: PromptInput)`:
  - Une el system prompt, el few-shot (si existe) y el user prompt en un solo string.

---

## 6. Critique Agent (Agente de Revisión y Corrección)

- El Critique Agent recibe el mismo contexto que el LLM, incluyendo SimpPreference en el comentario inline del prompt.
- Evalúa la respuesta generada según las reglas de tono, ética, personalización, adecuación y la preferencia de Simp.
- Puede corregir la respuesta si no respeta la preferencia de Simp o el tono adecuado para el contexto.

---

## 7. Notas y Consideraciones

- **PromptBuilder centraliza toda la lógica de construcción de prompts**. Para modificar el comportamiento, edita los archivos en `backend/prompt-builder/` o el prompt de sistema en `.txt`.
- **El Critique Agent está activo SIEMPRE**: toda respuesta pasa por su revisión antes de llegar al usuario.
- **El sistema es extensible**: puedes agregar nuevos modos, etapas o ejemplos few-shot fácilmente.
- **El usuario tiene control total sobre el tipo de respuesta, la etapa de la conversación, el idioma y el estilo de Simp** gracias a los dropdowns.
- **El historial y contexto del usuario** se incluyen explícitamente en el prompt de usuario, permitiendo personalización avanzada.
- **El flujo es fácilmente auditable y versionable.**

---

**Última actualización:** 2024-06-09 (PromptBuilder modular centralizado, intent y stage explícitos desde la UI, Critique Agent siempre activo, SimpPreference unificado y almacenado en columna dedicada) 