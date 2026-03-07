import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  };
}

function createPrisma(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is required');

  const opts = parseDbUrl(dbUrl);
  const adapter = new PrismaMariaDb(opts);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
