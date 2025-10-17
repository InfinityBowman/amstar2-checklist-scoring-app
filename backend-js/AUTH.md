# Authentication

The authentication system uses:

- JWT access tokens (short-lived, 15 minutes by default)
- Refresh tokens in HTTP-only cookies (7 days by default)
- Email verification for new accounts
- Password reset functionality

## Auth Endpoints

- `POST /api/v1/auth/signup` - Create a new user
- `POST /api/v1/auth/signin` - Sign in and get access token
- `POST /api/v1/auth/refresh` - Refresh an expired access token
- `POST /api/v1/auth/signout` - Sign out
- `POST /api/v1/auth/send-verification` - Send verification email
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

## User Endpoints

- `GET /api/v1/users/me` - Get current user profile

# Email Configuration

The system is configured to send emails via SMTP for:

- Email verification
- Password reset

In development mode, Ethereal.email is used as a test SMTP provider, and you'll see links to view the sent emails in the console.

For production, configure your SMTP settings in the `.env` file:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-password-here
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=AMSTAR2 App
```

# Database Management

- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:migrate` - Apply migrations to database
- `bun run db:push` - Push schema to database without migrations
- `bun run db:studio` - Open web-based database explorer
- `bun run db:drop` - Generate migration to drop tables
