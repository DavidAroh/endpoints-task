import type { IncomingHttpHeaders } from 'http';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ExternalData {
  ip: string;
  country: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}

export interface RequestInfo {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: IncomingHttpHeaders;
}
