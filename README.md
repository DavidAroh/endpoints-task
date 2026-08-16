# Week 1: JavaScript, TypeScript & Node.js

## Overview
This project completes the Week 1 practical task: **build a simple Node.js/TypeScript server with multiple endpoints**.

## Topics Covered
- ✅ Modern JavaScript fundamentals
- ✅ Asynchronous programming with Promises and async/await
- ✅ TypeScript basics (interfaces, generics, strict typing)
- ✅ Node.js fundamentals (http module)
- ✅ NPM and project setup
- ✅ Environment variables (dotenv)
- ✅ Basic HTTP concepts (methods, status codes, routes, query params)

## Project Structure
```
week-1/
├── src/
│   ├── types.ts      # Shared TypeScript interfaces & types (incl. generic ApiResponse<T>)
│   ├── data.ts       # In-memory data + simulated async DB/API calls
│   ├── handlers.ts   # One async handler per endpoint, plus response helpers
│   └── server.ts     # HTTP server entry: routing table, CORS, logging, graceful shutdown
├── .env              # Environment variables
├── package.json      # Project configuration & scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Requirements

- **Node.js >= 23.6** — the dev script runs TypeScript directly using Node's built-in type stripping (`node --watch src/server.ts`), so **no ts-node or other runner is needed**.
- npm (ships with Node).

## Setup & Installation

```bash
# Navigate to week-1 folder
cd week-1

# Install dependencies (needed once — provides typescript & dotenv)
npm install

# Run the server in development mode (native TypeScript + auto-restart on save)
npm run dev

# OR build and run (production mode)
npm run build
npm start

# Check types without emitting files
npm run typecheck
```

## Available Endpoints

### 1. Home Page
```
GET http://localhost:3000/
```

### 2. List All Users
```
GET http://localhost:3000/api/users
```

### 3. Get User by ID
```
GET http://localhost:3000/api/users/1
GET http://localhost:3000/api/users/2
GET http://localhost:3000/api/users/3
```

### 4. Server Information
```
GET http://localhost:3000/api/info
```

### 5. Health Check
```
GET http://localhost:3000/api/health
```

### 6. Calculator
```
GET http://localhost:3000/api/calculate?operation=add&a=5&b=3
GET http://localhost:3000/api/calculate?operation=subtract&a=10&b=4
GET http://localhost:3000/api/calculate?operation=multiply&a=6&b=7
GET http://localhost:3000/api/calculate?operation=divide&a=20&b=5
```

## Features Demonstrated

### TypeScript Basics
- **Interfaces**: `User`, `ApiResponse<T>`, `RequestInfo`
- **Generics**: `ApiResponse<T>` wraps any payload type; generic `ok<T>()` / `fail<T>()` helpers
- **Type-only imports**: `import type` for type safety without runtime cost
- **Strict mode**: `strict: true` in `tsconfig.json`

### Modern JavaScript
- **Arrow functions** throughout
- **Template literals** for string interpolation
- **Destructuring** (`const { status } = ...`)
- **Array methods**: `find()`, spread copy `[...users]`
- **Optional chaining** & null checks via `parseNumberParam()`

### Asynchronous Programming
- **Promises**: `new Promise((resolve) => setTimeout(...))` in `data.ts`
- **async/await**: every handler and data accessor is `async` and awaits simulated DB/API calls
- **Separation of concerns**: handlers never touch timers directly

### Node.js Fundamentals
- **Native TypeScript execution**: `npm run dev` runs `node --watch src/server.ts` — Node strips types at runtime, no build step or ts-node needed
- **ESM modules**: project uses `"type": "module"` with explicit `.ts` extensions in imports (`rewriteRelativeImportExtensions` rewrites them to `.js` in the compiled output)
- **http module**: server created with `http.createServer`
- **URL parsing**: `new URL()` for path + `URLSearchParams` for query strings
- **Environment variables**: dotenv + `process.env.PORT` / `APP_NAME` / `NODE_ENV`
- **Process management**: graceful shutdown on `SIGINT` / `SIGTERM`
- **Error handling**: `server.on('error')` for `EADDRINUSE`, try/catch around dispatch

### HTTP Concepts
- **RESTful API design**: clean endpoint structure
- **JSON responses**: standardized envelope `{ success, message, timestamp, data }`
- **Status codes**: 200, 204, 400 (bad request), 404 (unknown path / missing resource), 405 (wrong method), 500 (server error)
- **Custom `HttpError`**: handlers throw it to signal 4xx responses; `dispatch` catches it and maps it to the right status code
- **CORS headers**: cross-origin access plus OPTIONS preflight handling
- **Query parameters**: `operation`, `a`, `b` validated before use
- **Request logging**: one timestamped log line per request

## Environment Variables

Create a `.env` file with:
```env
PORT=3000
NODE_ENV=development
APP_NAME=Week1-TypeScript-Server
```

## Testing the Server

Once the server is running, test it with your browser, curl, or Postman/Insomnia:

```bash
# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Server info
curl http://localhost:3000/api/info

# Health check
curl http://localhost:3000/api/health

# Calculator
curl "http://localhost:3000/api/calculate?operation=multiply&a=5&b=10"

# Error cases
curl http://localhost:3000/api/nope                       # 404 — unknown path
curl http://localhost:3000/api/users/99                   # 404 — user not found
curl http://localhost:3000/api/users/abc                  # 404 — invalid user id
curl "http://localhost:3000/api/calculate?operation=divide&a=1&b=0"  # 400 — divide by zero
curl "http://localhost:3000/api/calculate?operation=power&a=2&b=3"   # 400 — invalid operation
```

## Next Steps

After completing Week 1, you can:
1. Add more endpoints (POST, PUT, DELETE)
2. Implement middleware
3. Add input validation
4. Connect to a real database
5. Add authentication
6. Write unit tests

---
**Week 1 Task Completed** ✅
