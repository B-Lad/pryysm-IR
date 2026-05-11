// Prisma client singleton to prevent multiple instantiations in development
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Ensure connection is established
export async function ensurePrismaConnected() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Prisma database connection established');
    return true;
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error);
    throw error;
  }
}
