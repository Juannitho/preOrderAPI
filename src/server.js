import app from "./app.js";
import { env } from './config/env.js';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq.js';
import { assertQueues } from './services/queue.service.js';
import { prisma } from './config/db.js';

await connectRabbitMQ();
await assertQueues();

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await closeRabbitMQ();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));