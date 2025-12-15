export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const MOCK_USERS: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  'user-2': {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    createdAt: new Date('2024-02-20T14:30:00Z'),
    updatedAt: new Date('2024-02-20T14:30:00Z'),
  },
  'user-3': {
    id: 'user-3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    createdAt: new Date('2024-03-10T09:15:00Z'),
    updatedAt: new Date('2024-03-10T09:15:00Z'),
  },
};

export function getUserOrThrow(userId: string): User {
  const user = MOCK_USERS[userId];
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  return user;
}
export function userExists(userId: string): boolean {
  return userId in MOCK_USERS;
}

export function getAllMockUsers(): User[] {
  return Object.values(MOCK_USERS);
}
