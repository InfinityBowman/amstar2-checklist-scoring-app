## Auth with FastAPI

**Implementation Notes:**

- Use email/password login only.
- Issue an access JWT (short-lived) and a refresh token in an HttpOnly cookie.
- Refresh token should have a longer lifetime (like 7 days), actual token should be like 15min
- The FastAPI JWT examples in the FastAPI docs do not use HttpOnly cookies for refresh tokens, which we want to implement to improve security.

**Endpoints**

**POST /auth/signup**

Description: Create a new user.
Request Body:
{
"email": "test@test.com",
"password": "Test123",
"name": "Test User"
}

Responses:
201 Created – user successfully created
400 Bad Request – missing username/password
409 Conflict – email already exists

**POST /auth/signin**
Description: Log in user, set refresh cookie, return access token.
Request Body:
{
"email": "test@test.com",
"password": "Test123"
}

Responses:
200 OK
{
"accessToken": "<jwt>"
}
Sets Set-Cookie: refresh=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
401 Unauthorized – invalid credentials

**POST /auth/refresh**

Description: Issue new access token using refresh cookie.
Request: No body required, but must include cookie.
Responses:
200 OK
{
"accessToken": "<new-jwt>"
}
401 Unauthorized – missing cookie
403 Forbidden – invalid/expired refresh token

**POST /auth/signout**

Description: Clear refresh cookie.
Response:
200 OK – cookie cleared (Set-Cookie: refresh=; Max-Age=0)

**GET /users/me**

Description: Fetch the current logged-in user (protected).
Headers: Authorization: Bearer <accessToken>
Responses:
200 OK
{
"id": "alice",
"name": "Alice Example"
}
401 Unauthorized – missing/invalid token
403 Forbidden – expired token

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
