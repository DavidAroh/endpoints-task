import type { ApiResponse, RequestInfo, User } from './types.ts';
import { fetchAllUsers, fetchExternalData, fetchUserById } from './data.ts';

export function ok<T>(message: string, data?: T): ApiResponse<T> {
  return { success: true, message, timestamp: new Date().toISOString(), data };
}

export function fail<T = never>(message: string): ApiResponse<T> {
  return { success: false, message, timestamp: new Date().toISOString() };
}

export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export async function handleHome(info: RequestInfo): Promise<ApiResponse<string>> {
  const appName = process.env.APP_NAME || 'Week1-Server';
  return ok(`Welcome to ${appName}! This is a Node.js/TypeScript server built for Week 1.`);
}

export async function handleListUsers(info: RequestInfo): Promise<ApiResponse<User[]>> {
  const users = await fetchAllUsers();
  return ok(`Retrieved ${users.length} user${users.length === 1 ? '' : 's'}`, users);
}

export async function handleGetUser(info: RequestInfo, id: number): Promise<ApiResponse<User>> {
  const user = await fetchUserById(id);
  if (!user) {
    throw new HttpError(404, `User with ID ${id} not found`);
  }
  return ok('User found', user);
}

export async function handleServerInfo(info: RequestInfo): Promise<ApiResponse<object>> {
  const external = await fetchExternalData();
  return ok('Server information', {
    appName: process.env.APP_NAME || 'Week1-Server',
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.round(process.uptime()),
    memoryRssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    external,
  });
}

export async function handleHealth(
  info: RequestInfo,
): Promise<ApiResponse<{ status: string; uptimeSeconds: number }>> {
  return ok('Server is healthy', {
    status: 'UP',
    uptimeSeconds: Math.round(process.uptime()),
  });
}

export async function handleCalculate(info: RequestInfo): Promise<ApiResponse<number>> {
  const operation = info.query.get('operation');
  const a = parseNumberParam(info.query.get('a'));
  const b = parseNumberParam(info.query.get('b'));

  if (a === null || b === null) {
    throw new HttpError(400, 'Missing or invalid query params. Usage: /api/calculate?operation=add&a=5&b=3');
  }

  switch (operation) {
    case 'add':
      return ok(`${a} + ${b} = ${a + b}`, a + b);
    case 'subtract':
      return ok(`${a} - ${b} = ${a - b}`, a - b);
    case 'multiply':
      return ok(`${a} * ${b} = ${a * b}`, a * b);
    case 'divide':
      if (b === 0) {
        throw new HttpError(400, 'Cannot divide by zero');
      }
      return ok(`${a} / ${b} = ${a / b}`, a / b);
    default:
      throw new HttpError(400, 'Invalid operation. Use one of: add, subtract, multiply, divide');
  }
}

function parseNumberParam(value: string | null): number | null {
  if (value === null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
