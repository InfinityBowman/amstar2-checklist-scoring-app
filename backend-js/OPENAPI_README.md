# OpenAPI Documentation Guide

## Accessing API Documentation

When the server is running, you can access the API documentation in multiple ways:

1. **Swagger UI**: `http://localhost:3004/docs`
   - Interactive documentation with a clean interface
   - Test API endpoints directly from the UI
   - View request/response schemas

## Authentication in the API Docs

1. **Authenticating in Swagger UI**:
   - First, make a request to `/auth/api/signin` with your credentials
   - Copy the `accessToken` from the response
   - Click the "Authorize" button (🔒) at the top
   - Enter the token as `Bearer YOUR_TOKEN`
   - Now you can access protected endpoints

2. **Testing Protected Endpoints**:
   - All endpoints marked with a lock icon (🔒) require authentication
   - Make sure you've completed the authorization step before testing these

## Available Endpoints

### Authentication Endpoints

- **POST /auth/api/signup**
  - Create a new user account
  - Required fields: email, name, password

- **POST /auth/api/signin**
  - Login with email and password
  - Returns an access token for API access

- **POST /auth/api/refresh**
  - Get a new access token using refresh token
  - Requires an unexpired refresh token cookie

- **POST /auth/api/verify-email**
  - Verify email with verification code
  - Requires the user ID and verification code

- **POST /auth/api/request-email-verification**
  - Request a new email verification code
  - Requires the user ID

- **POST /auth/api/forgot-password**
  - Request a password reset code
  - Requires the user's email

- **POST /auth/api/reset-password**
  - Reset password with reset code
  - Requires user ID, reset code, and new password

### User Endpoints

- **GET /api/v1/users/me**
  - Get current user profile
  - Requires authentication

## Extending the Documentation

To add documentation for new endpoints:

1. Add type validation to your routes using Elysia's `t` object
2. Include detailed descriptions in the schema
3. Add `detail` property to routes with summary and description

Example:

```javascript
.get('/example',
  () => 'This is an example',
  {
    detail: {
      summary: 'Example endpoint',
      description: 'This is an example endpoint that returns a string'
    }
  }
)
```
