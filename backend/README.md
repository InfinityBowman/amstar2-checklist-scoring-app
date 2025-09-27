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

**POST /auth/send-verification**

Description: Send a verification code to the user's email after signup.  
Request Body:

```json
{
  "email": "test@test.com"
}
```

Responses:

- 200 OK – verification email sent
- 400 Bad Request – missing email
- 404 Not Found – user not found

**POST /auth/verify-email**

Description: Verify the user's email using the code sent.
Request Body:

```json
{
  "email": "test@test.com",
  "code": "123456"
}
```

Responses:

- 200 OK – email verified
- 400 Bad Request – missing email/code
- 401 Unauthorized – invalid code
- 404 Not Found – user not found

**POST /auth/request-password-reset**

Description: Request a password reset email.
Request Body:

```json
{ "email": "test@test.com" }
```

Responses:

- 200 OK – reset email sent
- 400 Bad Request – missing email

**POST /auth/reset-password**

Description: Reset password using code sent to email.
Request Body:

```json
{
  "email": "test@test.com",
  "code": "123456",
  "new_password": "NewPassword123"
}
```

Responses:

- 200 OK – password reset successful
- 400 Bad Request – missing fields
- 401 Unauthorized – invalid code
- 404 Not Found – user not found

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

## Email SMTP Integration

**Purpose:**  
Send transactional emails (e.g. email verification, password reset) using Mailgun or Postmark.  
Send a code that has a expirary time of 15min. Set this in the user table as:

```sql
users (
  ...
  email_verified_at            TIMESTAMP,  -- when the email was verified, we dont need a boolean
  email_verification_requested TIMESTAMP,  -- when verification was requested
  email_verification_pin       TEXT,       -- the current verification code
)
```

**Implementation Notes:**

- Use something like aiosmtplib.
- Store SMTP credentials (host, port, username, password) in environment variables or a config file.
- Use secure connections (TLS/SSL) for all SMTP traffic.

```json
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@yourdomain.com
SMTP_PASSWORD=yourpassword
SMTP_FROM=yourapp@yourdomain.com
```
