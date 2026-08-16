import * as http from 'http';
import * as dotenv from 'dotenv';

import type { ApiResponse, RequestInfo } from './types.ts';
import {
  fail,
  handleCalculate,
  handleGetUser,
  handleHealth,
  handleHome,
  handleListUsers,
  handleServerInfo,
  HttpError,
} from './handlers.ts';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;
const APP_NAME: string = process.env.APP_NAME || 'Week1-Server';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface Route {
  method: HttpMethod;
  pattern: RegExp;
  handler: (info: RequestInfo, match: RegExpExecArray) => Promise<ApiResponse<unknown>>;
}

const routes: Route[] = [
  { method: 'GET', pattern: /^\/$/, handler: handleHome },
  { method: 'GET', pattern: /^\/api\/users$/, handler: handleListUsers },
  {
    method: 'GET',
    pattern: /^\/api\/users\/(\d+)$/,
    handler: (info, match) => handleGetUser(info, Number(match[1])),
  },
  { method: 'GET', pattern: /^\/api\/info$/, handler: handleServerInfo },
  { method: 'GET', pattern: /^\/api\/health$/, handler: handleHealth },
  { method: 'GET', pattern: /^\/api\/calculate$/, handler: handleCalculate },
];

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body, null, 2));
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function logRequest(info: RequestInfo): void {
  const queryString = info.query.toString();
  const fullPath = queryString ? `${info.path}?${queryString}` : info.path;
  console.log(`[${new Date().toISOString()}] ${info.method} ${fullPath}`);
}

async function dispatch(info: RequestInfo, res: http.ServerResponse): Promise<void> {
  let route: Route | undefined;
  let match: RegExpExecArray | null = null;
  for (const candidate of routes) {
    match = candidate.pattern.exec(info.path);
    if (match) {
      route = candidate;
      break;
    }
  }

  if (!route || !match) {
    sendJson(
      res,
      404,
      fail(
        `Endpoint ${info.path} not found. Available endpoints: /, /api/users, /api/users/:id, /api/info, /api/health, /api/calculate`,
      ),
    );
    return;
  }

  if (route.method !== info.method) {
    res.setHeader('Allow', route.method);
    sendJson(
      res,
      405,
      fail(`Method ${info.method} not allowed on ${info.path}. Use ${route.method}.`),
    );
    return;
  }

  try {
    const response = await route.handler(info, match);
    sendJson(res, 200, response);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, fail(error.message));
      return;
    }
    throw error;
  }
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const info: RequestInfo = {
    method: (req.method || 'GET').toUpperCase(),
    path: url.pathname,
    query: url.searchParams,
    headers: req.headers,
  };

  logRequest(info);
  setCorsHeaders(res);

  if (info.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    await dispatch(info, res);
  } catch (error) {
    console.error('Unhandled request error:', error);
    sendJson(res, 500, fail('Internal server error'));
  }
}

const server = http.createServer(handleRequest);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Pick another port via the PORT environment variable.`);
  } else {
    console.error('Server error:', error.message);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`
 Week 1: Node.js/TypeScript Server Started             

Server running at http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
App Name: ${APP_NAME}

Available Endpoints:
  GET /                  Home page
  GET /api/users         List all users
  GET /api/users/:id     Get user by ID
  GET /api/info          Server information
  GET /api/health        Health check
  GET /api/calculate     Calculator (query: operation, a, b)

Example Calculator Usage:
  http://localhost:${PORT}/api/calculate?operation=add&a=5&b=3
  http://localhost:${PORT}/api/calculate?operation=multiply&a=4&b=7
`);
});

function shutdown(signal: string): void {
  console.log(`\n Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
