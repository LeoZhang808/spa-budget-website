import { prismaMock } from './mocks/database';

jest.mock('../src/config/database', () => ({
  prisma: prismaMock,
  disconnectDatabase: jest.fn(),
}));
