## Auth with FastAPI

**Implementation Notes:**

- Use email/password login only.
- Issue an access JWT (short-lived) and a refresh token in an HttpOnly cookie.
- Refresh token should have a longer lifetime (like 7 days), actual token should be like 15min
- The FastAPI JWT examples in the FastAPI docs do not use HttpOnly cookies for refresh tokens, which we want to implement to improve security.

---

## Server-Sent Events (SSE)

**Purpose:**  
Push real-time updates from the backend to the frontend in a one-way stream.

**Implementation Notes:**

- Use **FastAPI’s `StreamingResponse`** to create a streaming endpoint.
- Example use case:
  - A user is added to a collaborative project.
  - Backend sends an SSE event.
  - Frontend listens for these events and updates the UI automatically (no polling required).

---

## WebSocket Connections

**Purpose:**  
Enable bi-directional, real-time communication between frontend and backend. This is for the live merge editor when we implement that (much later on).
The FastAPI docs have a section on WebSockets in the advanced user guide.

**Implementation Notes:**

- Use **FastAPI WebSocket endpoints**.
- Integrate with **PostgreSQL LISTEN/NOTIFY** for database-driven updates.
- Example use case:
  - Collaborative checklist merge editor.
  - Backend listens to database changes via `LISTEN/NOTIFY`.
  - WebSocket connections push updates to all subscribed clients (pub/sub (publish/subscribe) pattern).
