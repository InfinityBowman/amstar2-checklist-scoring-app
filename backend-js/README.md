# AMSTAR2 Backend API - Bun/Elysia

This is the Bun/Elysia backend API for the AMSTAR2 Checklist Scoring App.

## Features

- Authentication system with JWT tokens
- Email verification and password reset
- User management
- Project, Review and Checklist endpoints
- OpenAPI documentation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   bun install
   ```
2. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file with your database and SMTP settings
4. Run database migrations:
   ```bash
   bun run db:migrate
   ```
5. Start the development server:
   ```bash
   bun run dev
   ```

## Development

The server runs on port 3004 by default. You can change this in your `.env` file.

OpenAPI documentation is available at: http://localhost:3004/swagger
