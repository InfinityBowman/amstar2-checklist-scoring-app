# AMSTAR2 Checklist Scoring App - Agent README

## Project Overview

The AMSTAR2 Checklist Scoring App is a web application designed to help researchers and systematic reviewers complete the AMSTAR2 checklist for evaluating systematic reviews. The system allows for collaborative review, scoring, and analysis of research papers using the AMSTAR2 methodology.

## Architecture

This project uses a multi-tier architecture:

1. **Frontend**: Built with SolidJS/React for the UI
2. **Backend**: Two backend options:
   - Original Python FastAPI backend (in `/backend` directory)
   - New Bun/Elysia backend (in `/backend-js` directory) - currently being developed
3. **Database**: PostgreSQL with Drizzle ORM for the JS backend

## Important Directories

```
amstar2-checklist-scoring-app/
├── backend/             # Original FastAPI Python backend
├── backend-js/          # New Bun/Elysia backend (in active development)
│   ├── src/             # Source code
│   │   ├── db/          # Database schemas and connections
│   │   ├── emails/      # Email templates
│   │   ├── routes/      # API routes
│   │   │   ├── api/     # API endpoints
│   │   └── utils/       # Utility functions
├── frontend/            # Frontend SolidJS/React application
└── resources/           # Additional resources
```

## Authentication Architecture

The auth system in the JS backend uses **better-auth** with Elysia and has the following components:

- JWT-based authentication with access and refresh tokens
- Email verification flow
- Password reset functionality
- Integration with Drizzle ORM for database operations

## Key Technical Information

### JS Backend (Bun/Elysia)

- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Framework**: Elysia (lightweight web framework)
- **ORM**: Drizzle ORM for PostgreSQL
- **Authentication**: better-auth package integrated with Elysia
- **Documentation**: OpenAPI/Swagger via @elysiajs/openapi
- **Email**: Nodemailer for sending verification and reset emails

### Integration Notes

1. **better-auth Integration**:
   - Must use `.mount(auth.handler)` pattern for routes
   - Create auth middleware using `auth.api.getSession()` for protected routes
   - Access OpenAPI docs at `/docs` or `/swagger`

2. **Drizzle ORM Usage**:
   - Indexes are defined using the `(table) => ({})` syntax
   - Relations are set up in the schema files
   - Query builder is available via `db.query.*`

3. **Environment Variables**:
   - JWT_SECRET: Secret for JWT tokens
   - ACCESS_TOKEN_EXPIRE: Expiry time for access tokens (default: 15m)
   - REFRESH_TOKEN_EXPIRE_DAYS: Days until refresh tokens expire (default: 7)
   - SMTP\_\* variables for email configuration

## Running the Application

### JS Backend

```bash
# From the root directory
cd backend-js

# Install dependencies
bun install

# Run development server
bun dev
```

### Accessing API Documentation

After starting the server, access:

- Swagger UI: http://localhost:3004/docs
- OpenAPI JSON: http://localhost:3004/swagger.json

## Workflow Notes

- Authentication is handled via the `/auth/*` endpoints provided by better-auth
- User profile and data endpoints are available under `/api/v1/users/*`
- All routes requiring authentication should use the protection middleware

## Common Issues and Solutions

1. **better-auth Integration**:
   - Make sure to use `.mount(auth.handler)` instead of `.use(auth)`
   - For protection middleware, use auth API to get session data

2. **Drizzle ORM Issues**:
   - Index definitions must use function syntax: `(table) => ({ ...indexes })`
   - Relations should be properly defined with references

3. **Package Dependencies**:
   - Ensure compatible versions between Elysia and better-auth
