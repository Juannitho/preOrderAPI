import amqp from 'amqplib';
import { env } from './env.js';

let connection = null;
let channel = null;

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectRabbitMQ() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            connection = await amqp.connect(env.rabbitmqUrl);
            channel = await connection.createChannel();

            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err.message);
            });

            connection.on('close', () => {
                console.error('RabbitMQ connection closed');
                connection = null;
                channel = null;
            });

            console.log('Connected to RabbitMQ');
            return channel;
        } catch (err) {
            console.warn(
                `RabbitMQ connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
            );
            if (attempt === MAX_RETRIES) throw err;
            await sleep(RETRY_DELAY_MS);
        }
    }
}

export function getChannel() {
    if (!channel) {
        throw new Error('RabbitMQ channel not available');
    }
    return channel;
}

export async function closeRabbitMQ() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err) {
        console.error('Error closing RabbitMQ:', err.message);
    }
}