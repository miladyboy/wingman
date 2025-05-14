# Documentación de Cambios: Implementación de Mejoras en la Experiencia de Chat

## 1. Permitir pegar imágenes desde el portapapeles (Ctrl+V/Cmd+V)

### Objetivo
Permitir que los usuarios puedan pegar imágenes directamente en el campo de texto del chat usando Ctrl+V o Cmd+V, y que estas imágenes se agreguen automáticamente como archivos seleccionados, igual que si las hubieran subido manualmente.

### Implementación paso a paso

1. **Identificar el componente relevante**
   - El componente principal para la entrada de mensajes e imágenes es `UploadComponent.jsx`.

2. **Agregar un handler para el evento `onPaste`**
   - Se creó una función `handlePaste` usando `useCallback` para manejar el evento de pegado en el `<Textarea>`.
   - Esta función revisa los items del portapapeles (`event.clipboardData.items`) y filtra aquellos que sean archivos de tipo imagen (`item.kind === 'file' && item.type.startsWith('image/')`).
   - Los archivos encontrados se convierten en objetos `File` y se pasan a la función `addFiles`, que ya gestiona la lógica de previews y selección de archivos.
   - Si se detectan imágenes, se previene el comportamiento por defecto (`event.preventDefault()`) para evitar que la imagen se pegue como base64 en el textarea.
   - Se agrega un log informativo para facilitar debugging: `console.log('[UploadComponent] Imágenes pegadas desde el portapapeles:', imageFiles.map(f => f.name));`

3. **Conectar el handler al textarea**
   - Se pasa el handler `handlePaste` como prop `onPaste` al componente `<Textarea>`.

4. **Resultado**
   - El usuario puede pegar una o varias imágenes y estas aparecerán como previews, listas para ser enviadas.
   - El flujo de subida y envío de imágenes no cambia para el usuario.

#### Fragmento de código relevante
```jsx
<Textarea
  value={text}
  onChange={handleTextChange}
  onKeyDown={handleTextareaKeyDown}
  onPaste={handlePaste} // Permite pegar imágenes desde el portapapeles
  ...
/>
```

---

## 2. Reemplazo del mensaje de bienvenida por bloque customizado con animación

### Objetivo
Mostrar un mensaje de bienvenida más atractivo y útil cuando no hay conversaciones activas, con el título "Your wingman is ready" y un bloque de instrucciones, todo centrado y con animación fade-in en el título.

### Implementación paso a paso

1. **Identificar el componente relevante**
   - El mensaje de bienvenida se muestra en el componente `ChatEmptyState.jsx`.

2. **Reemplazar el contenido**
   - Se reemplazó el texto plano por un bloque estructurado:
     - Un `<h2>` con el texto "Your wingman is ready" como título.
     - Un bloque `<div>` con instrucciones y emojis, cada línea en su propio `<div>`.
   - Se usaron utilidades de Tailwind para centrar vertical y horizontalmente (`flex flex-col items-center justify-center h-full min-h-[300px] text-center`).

3. **Agregar animación fade-in al título**
   - Se añadió la clase `animate-fade-in` al `<h2>`.
   - Se definió la animación personalizada en `tailwind.config.js`:
     - En `extend.keyframes`, se agregó:
       ```js
       'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
       ```
     - En `extend.animation`, se agregó:
       ```js
       'fade-in': 'fade-in 1s ease forwards',
       ```
   - Esto permite usar `animate-fade-in` en cualquier elemento para aplicar el efecto.

4. **Resultado**
   - Cuando no hay conversaciones activas, el usuario ve el bloque de bienvenida centrado, con el título apareciendo suavemente.
   - El mensaje es más claro, visualmente atractivo y útil para nuevos usuarios.

#### Fragmento de código relevante
```jsx
<div
  className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground pt-10"
  data-testid="chat-empty-state"
>
  <h2
    className="text-3xl font-bold mb-4 text-foreground opacity-0 animate-fade-in"
    style={{ transition: 'opacity 1s ease' }}
  >
    Your wingman is ready
  </h2>
  <div className="space-y-2 text-lg">
    <div>💬 Upload a screenshot or paste your convo.</div>
    <div>📸 Image, text, or both, whatever works best.</div>
    <div>🧠 Harem will read the vibe and give you smart replies instantly.</div>
    <div>🗣️ Or just ask for advice, we're here for your flirting dilemmas.</div>
  </div>
</div>
```

#### Fragmento de configuración Tailwind
```js
// tailwind.config.js
extend: {
  keyframes: {
    'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  },
  animation: {
    'fade-in': 'fade-in 1s ease forwards',
  },
}
```

---

## 3. Barra de búsqueda de chats/threads en el Sidebar

### Objetivo
Permitir a los usuarios buscar y filtrar rápidamente sus chats/threads por nombre desde el Sidebar, mejorando la experiencia de navegación en conversaciones activas o históricas.

### Implementación paso a paso

1. **Identificar el componente relevante**
   - El listado de chats/threads y la UI del Sidebar se gestionan en `Sidebar.jsx`.

2. **Agregar estado y lógica de búsqueda**
   - Se añadió un estado local `searchQuery` usando `useState` para almacenar el texto de búsqueda.
   - Se creó la función pura y reutilizable `filterThreadsByName` en `frontend/src/utils/threadUtils.js`, que filtra los threads por coincidencia parcial e insensible a mayúsculas/minúsculas.
   - Se agregaron logs informativos para facilitar debugging y monitoreo.

3. **Integrar el campo de búsqueda en la UI**
   - Se insertó un `<Input />` (de shadcn/ui) en la parte superior del Sidebar, justo debajo del botón "+" New Chat".
   - El input tiene placeholder "Search chats…", `aria-label` y `data-testid="chat-search-input"` para accesibilidad y testing.
   - Al escribir, la lista de chats se filtra en tiempo real usando la función de utilidad.

4. **Renderizado y feedback visual**
   - Si la búsqueda no arroja resultados, se muestra el mensaje "No chats found."
   - Si el campo está vacío, se muestran todos los chats.

5. **Testabilidad**
   - Se añadieron pruebas unitarias para la función de filtrado en `frontend/src/utils/__tests__/threadUtils.test.js`.
   - Se agregó un test E2E en Playwright (`frontend/tests/e2e/chat.spec.ts`) que valida el filtrado, el mensaje de no resultados y el restablecimiento de la lista.

6. **Documentación y contexto**
   - Se documentó la funcionalidad en `@CONTEXT.md` para facilitar futuras modificaciones y mantener la coherencia del sistema.

#### Fragmento de código relevante
```jsx
<Input
  type="text"
  value={searchQuery}
  onChange={e => setSearchQuery(e.target.value)}
  placeholder="Search chats…"
  className="mt-3"
  data-testid="chat-search-input"
  aria-label="Buscar chats"
/>
```

#### Fragmento de función de filtrado
```js
export function filterThreadsByName(threads, query) {
  if (!Array.isArray(threads) || typeof query !== 'string') return threads;
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return threads;
  return threads.filter(thread =>
    thread.name && thread.name.toLowerCase().includes(normalizedQuery)
  );
}
```

---

## Notas finales
- Ambos cambios son modulares, reutilizables y fácilmente testeables.
- Se recomienda documentar los handlers y animaciones para facilitar futuras modificaciones.
- El enfoque seguido permite replicar estas mejoras en cualquier app React moderna con Tailwind.
