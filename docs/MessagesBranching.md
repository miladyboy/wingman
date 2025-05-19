# Messages Branching — Especificación Técnica

## Resumen
Este documento describe la arquitectura y el flujo para implementar un sistema de branching (ramificación) de mensajes en una aplicación de chat con LLM. Permite que cada mensaje de respuesta del LLM pueda tener múltiples alternativas (branches), y que cada branch pueda a su vez ser el punto de partida para nuevos sub-branches, formando un árbol de conversación persistente y navegable.

---

## 1. Modelo de Datos (Persistencia en Base de Datos)

### Tabla: `messages`
- `id` (PK): Identificador único del mensaje.
- `conversation_id` (FK): Conversación a la que pertenece el mensaje.
- `parent_message_id` (nullable, FK a messages.id): Mensaje padre del cual se ramifica este mensaje. Es `null` para el primer mensaje de la conversación.
- `branch_index` (int): Índice de la rama entre los hermanos (ej: 1, 2, 3... para branches alternativos de un mismo padre).
- `sender` ('user' | 'ai'): Quién envió el mensaje.
- `content`: Texto del mensaje.
- `image_description`: Descripción de imagen si aplica.
- `created_at`: Timestamp de creación.
- `root_prompt_id` (opcional): Para agrupar branches de un mismo prompt.
- `branch_path` (opcional): Array de ids o string tipo "1.2.1" para navegación rápida.

#### Relaciones
- Cada mensaje puede tener múltiples hijos (branches).
- El mensaje raíz tiene `parent_message_id = null`.
- Cada re-roll crea un nuevo mensaje con el mismo `parent_message_id` que el mensaje original.

---

## 2. Lógica de Branching

- **Enviar mensaje:**
  - El usuario envía un mensaje → LLM responde → se crea un mensaje AI con `parent_message_id` apuntando al mensaje del usuario.
- **Re-roll:**
  - El usuario hace re-roll sobre un mensaje AI → se crea un nuevo mensaje AI con el mismo `parent_message_id` y el siguiente `branch_index` disponible.
- **Sub-branch:**
  - Si el usuario está en un branch alternativo y hace re-roll, el nuevo mensaje AI tiene como `parent_message_id` el mensaje AI actual.

---

## 3. Navegación y UI

- **Visualización:**
  - Para cada mensaje AI con más de un branch (hermanos con el mismo `parent_message_id`), mostrar un selector tipo "1/3, 2/3, 3/3" con flechas para navegar entre branches.
  - Si el branch actual tiene hijos (sub-branches), permitir navegar hacia ellos.
  - El usuario puede volver a cualquier branch anterior y continuar la conversación desde ahí, creando nuevas ramas.

- **Identificador automático:**
  - Ejemplo: "Branch 2 from message #5" o "2/3" si hay tres branches hermanos.

---

## 4. Backend: Cambios Necesarios

- Almacenar `parent_message_id` y `branch_index` al crear cada mensaje.
- Endpoint para obtener el árbol de mensajes de una conversación.
- Endpoint para crear un nuevo branch (re-roll) a partir de un mensaje dado.
- Serialización del historial: al hacer re-roll, el historial enviado al LLM debe ser el camino desde la raíz hasta el mensaje donde se hace el re-roll.

---

## 5. Frontend: Cambios Necesarios

- Estructura de árbol en memoria: reconstruir el árbol de mensajes al cargar la conversación.
- Renderizado: mostrar los branches alternativos en cada mensaje AI con el selector de navegación.
- Al navegar a un branch alternativo, mostrar la conversación siguiendo ese camino.
- Al hacer re-roll, enviar el historial correspondiente y crear el nuevo branch.

---

## 6. Ejemplo de Flujo

1. Usuario envía mensaje (M1) → LLM responde (A1, branch 1/1).
2. Usuario hace re-roll en A1 → LLM responde (A2, branch 2/2).
3. Usuario navega a A2 y sigue la conversación (M2) → LLM responde (A3, branch 1/1 de A2).
4. Usuario vuelve a A1 y hace re-roll → LLM responde (A4, branch 3/3 de A1).
5. Usuario navega entre A1, A2, A4 y sus sub-branches.

---

## 7. Ventajas de este enfoque

- Escalable y flexible (soporta branching infinito).
- Persistente y fácil de navegar.
- Permite experimentar y comparar respuestas del LLM en cualquier punto de la conversación.

---

## 8. Siguientes pasos sugeridos

1. Diseñar/actualizar la tabla de mensajes para soportar `parent_message_id` y `branch_index`.
2. Crear endpoints para:
   - Obtener el árbol de mensajes de una conversación.
   - Crear un nuevo branch (re-roll) a partir de cualquier mensaje.
3. Actualizar el frontend para:
   - Renderizar el árbol y los selectores de branches.
   - Permitir navegación y re-roll en cualquier mensaje AI.
4. (Opcional) Agregar tests para asegurar la integridad del árbol y la navegación.

---

## 9. Consideraciones adicionales

- No hay límite de branches por ahora, pero el sistema debe estar preparado para muchos branches.
- Los branches deben persistirse en la base de datos para que el usuario pueda volver a ellos luego de refrescar la página o cerrar sesión.
- No es necesario que el usuario nombre los branches, pero deben tener un identificador automático.
- El historial enviado al LLM para un re-roll debe ser el camino desde la raíz hasta el mensaje donde se hace el re-roll.

---

**Este documento sirve como guía para implementar un sistema de branching robusto, escalable y fácil de usar en aplicaciones de chat con LLM.** 