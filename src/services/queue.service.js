import { getChannel } from '../config/rabbitmq.js';

export const PAYMENT_QUEUE = 'payment.events';
export const DEAD_LETTER_QUEUE = 'payment.events.dlq';
const DEAD_LETTER_EXCHANGE = 'payment.dlx';

export async function assertQueues() {
    const channel = getChannel();

    await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, '');

    await channel.assertQueue(PAYMENT_QUEUE, {
        durable: true,
        deadLetterExchange: DEAD_LETTER_EXCHANGE,
    });
}

export function publishPaymentEvent(event) {
    const channel = getChannel();

    const payload = {
        eventId: event.id,
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        failureMessage: event.data.object.last_payment_error?.message ?? null,
        receivedAt: new Date().toISOString(),
    };

    return channel.sendToQueue(
        PAYMENT_QUEUE,
        Buffer.from(JSON.stringify(payload)),
        {
            persistent: true,
            contentType: 'application/json',
            messageId: event.id,
        }
    );
}