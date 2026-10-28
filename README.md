# DevPulse API

A RESTful backend API for tracking software bugs and feature requests. DevPulse allows contributors to report and manage issues while maintainers oversee issue updates, workflow status, and deletion.

## Live API

**Base URL:** https://devpulse-api-akr.vercel.app

Health check: https://devpulse-api-akr.vercel.app/api/health

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization for contributors and maintainers
- Create and retrieve issues
- Update issue details with permission checks
- Maintainer-only issue deletion
- Issue filtering by type and status
- Sorting issues by creation date
- PostgreSQL database integration
- Centralized and consistent API responses

## Technology Stack

- Node.js 24+
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver and raw SQL queries
- bcrypt for password hashing
- jsonwebtoken for JWT authentication
- Vercel for deployment

## Getting Started

### Prerequisites

- Node.js 24 or higher
- npm
- A PostgreSQL database

### Installation

Clone the repository:

```bash
git clone https://github.com/rabbanictgbd/devpulse
cd devpulse
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Replace the placeholder values with your actual configuration. Never commit `.env` or expose database credentials and JWT secrets.

### Run the Application

Start the development server:

```bash
npm run dev
```

Build the TypeScript project:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

Use the scripts defined in `package.json` if their names differ.

## API Endpoints

Base URL: `https://devpulse-api-akr.vercel.app`

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a user |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Verify the current user |
| GET | `/api/auth/maintainer-test` | Maintainer | Test maintainer authorization |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Check API and database health |
| POST | `/api/issues` | Authenticated | Create an issue |
| GET | `/api/issues` | Public | Retrieve issues |
| GET | `/api/issues/:id` | Public | Retrieve a specific issue |
| PATCH | `/api/issues/:id` | Owner or maintainer | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer | Delete an issue |

### Issue Query Parameters

The issue listing endpoint supports the following assignment requirements:

| Parameter | Accepted values | Purpose |
|---|---|---|
| `sort` | `newest`, `oldest` | Sort by creation date |
| `type` | `bug`, `feature_request` | Filter by issue type |
| `status` | `open`, `in_progress`, `resolved` | Filter by workflow status |

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

### Create Issue Example

Request:

```http
POST /api/issues
Authorization: <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Database connection timeout",
  "description": "Database requests time out under heavy concurrent load.",
  "type": "bug"
}
```

The reporter ID should be obtained from the authenticated user's JWT, not supplied by the client.

## Authentication and Authorization

DevPulse uses JSON Web Tokens (JWT) to authenticate protected requests.

1. Register an account or log in.
2. Obtain the token from the login response.
3. Include the token in the `Authorization` header:

```http
Authorization: <JWT_TOKEN>
```

4. The server verifies the token before allowing access to protected operations.

### User Roles

**Contributor**
- Register and log in.
- Create issues and view issues.
- Update their own issue fields while the issue status is `open`.

**Maintainer**
- Perform contributor actions.
- Update any issue.
- Change issue workflow status independently.
- Delete any issue.

## Database Schema

### `users`

| Column | Description |
|---|---|
| `id` | Unique user identifier |
| `name` | User's display name |
| `email` | Unique login email |
| `password` | Securely hashed password |
| `role` | `contributor` or `maintainer` |
| `created_at` | Account creation timestamp |
| `updated_at` | Last update timestamp |

### `issues`

| Column | Description |
|---|---|
| `id` | Unique issue identifier |
| `title` | Issue title, maximum 150 characters |
| `description` | Issue details, minimum 20 characters |
| `type` | `bug` or `feature_request` |
| `status` | `open`, `in_progress`, or `resolved` |
| `reporter_id` | ID of the user who created the issue |
| `created_at` | Issue creation timestamp |
| `updated_at` | Last update timestamp |

The project uses PostgreSQL with the native `pg` driver and raw SQL queries, as required by the assignment.

## Response Format

Successful responses follow this general structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error responses follow this general structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Invalid request |
| `401` | Authentication required or invalid |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `500` | Internal server error |

## Testing

The deployed API has been tested using PowerShell's `Invoke-RestMethod`.

Verified operations include:
- Health check and database connectivity
- User registration and authentication
- Retrieving the authenticated user
- Listing issues and retrieving an individual issue
- Creating and updating issues
- Contributor access restrictions on maintainer-only operations

The maintainer-only DELETE operation returned a permission error when tested with a contributor token, as expected.

**Known verification items:** Confirm that issue responses include the required `type` field and that issue listing returns the required reporter details. Verify filtering, sorting, validation, and deletion using the appropriate roles before final submission.

## Deployment

The API is deployed on Vercel and uses a hosted PostgreSQL database.

- Live API: https://devpulse-api-akr.vercel.app
- Health endpoint: https://devpulse-api-akr.vercel.app/api/health

Ensure that production environment variables are configured in the hosting platform and that secrets are never committed to source control.

## License

This project was developed as part of a backend development assignment.
