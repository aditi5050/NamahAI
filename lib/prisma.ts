import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  const poolConfig: PoolConfig = {
    connectionString,
    max: 10, // Reduced pool size for better stability
    min: 2,  // Keep minimum connections alive
    idleTimeoutMillis: 60000, // 60 seconds idle timeout
    connectionTimeoutMillis: 15000, // 15 second connection timeout
    allowExitOnIdle: false, // Keep connections alive
    statement_timeout: 120000, // 120 second statement timeout
    query_timeout: 120000, // 120 second query timeout
  };

  const pool = new Pool(poolConfig);

  // Handle pool errors gracefully
  pool.on('error', (err) => {
    console.error('[Prisma Pool] Unexpected error on idle client:', err.message);
  });

  pool.on('connect', () => {
    console.log('[Prisma Pool] New client connected');
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ['error'],
    transactionOptions: {
      timeout: 120000, // 120 second transaction timeout
      maxWait: 15000,  // 15 second max wait for connection
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

globalThis.prisma = prisma;
