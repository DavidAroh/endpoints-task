import type { ExternalData, User } from './types.ts';

const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', createdAt: new Date('2024-01-15') },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', createdAt: new Date('2024-02-20') },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', createdAt: new Date('2024-03-10') },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllUsers(): Promise<User[]> {
  await delay(50);
  return [...users];
}

export async function fetchUserById(id: number): Promise<User | undefined> {
  await delay(30);
  return users.find((user) => user.id === id);
}

export async function fetchExternalData(): Promise<ExternalData> {
  await delay(40);
  return { ip: '192.168.1.1', country: 'USA' };
}
