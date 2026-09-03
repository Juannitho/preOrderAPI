import { prisma } from '../config/db.js';
import { connectRabbitMQ, getChannel, closeRabbitMQ } from '../config/rabbitmq.js';
import { assertQueues, PAYMENT_QUEUE } from '../services/queue.service.js';
import { recordQueuedPaymentEvent } from '../services/payment.service.js';

async function handleMessage(channel, msg) {
    if (!msg) return;

    let job;
    try {
        job = JSON.parse(msg.content.toString());
    } catch (err) {
        console.error('Malformed message, dead-lettering:', err.message);
        return channel.nack(msg, false, false);
    }

    try {
        await recordQueuedPaymentEvent(job);
        console.log(`Processed ${job.eventType} for ${job.paymentIntentId}`);
        channel.ack(msg);
    } catch (err) {
        console.error(`Failed to process ${job.eventId}:`, err);
        channel.nack(msg, false, false);
    }
}

async function start() {
    await connectRabbitMQ();
    await assertQueues();

    const channel = getChannel();
    await channel.prefetch(1);

    console.log(`Worker listening on ${PAYMENT_QUEUE}`);

    await channel.consume(PAYMENT_QUEUE, (msg) => handleMessage(channel, msg));
}

async function shutdown(signal) {
    console.log(`${signal} received, shutting down worker`);
    await closeRabbitMQ();
    await prisma.$disconnect();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
    console.error('Worker failed to start:', err);
    process.exit(1);
});