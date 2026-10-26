
# DevPulse API

DevPulse is an issue-tracking REST API built with Node.js, Express, TypeScript, and PostgreSQL.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL (`pg` driver)
- bcrypt for password hashing
- JSON Web Tokens (JWT) for authentication

## Prerequisites

- Node.js 24 or later
- PostgreSQL database
- npm

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_strong_secret_key
```

Never commit your actual `.env` file or database credentials to Git.

## Run in Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Run Production Build

```bash
npm start
```

## Health Check

```http
GET /api/health
```
