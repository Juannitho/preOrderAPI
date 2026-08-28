import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
    log:
        env.nodeEnv === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected via Prisma');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected via Prisma');
    } catch (error) {
        console.error('Database disconnection error:', error);
    }
}

export { prisma, connectDB, disconnectDB };   