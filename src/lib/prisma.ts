// Prisma client singleton to prevent multiple instantiations in development
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance with connection pooling
  prismaInstance = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, reuse the same instance to prevent connection exhaustion
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;

// Ensure connection is established with retry logic
export async function ensurePrismaConnected(maxRetries: number = 3): Promise<boolean> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Prisma database connection established');
      return true;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Prisma database connection failed (attempt ${attempt}/${maxRetries}):`, lastError.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

// Graceful shutdown to close database connections
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Prisma database connection closed');
  } catch (error) {
    console.error('Error closing Prisma connection:', error);
  }
}
