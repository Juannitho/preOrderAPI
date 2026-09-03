import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { recordStripeEvent } from '../services/payment.service.js';
import { publishPaymentEvent } from '../services/queue.service.js';

const HANDLED = new Set([
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
]);

export async function handleStripeWebhook(req, res) {
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            env.stripeWebhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
    }

    if (!HANDLED.has(event.type)) {
        return res.sendStatus(200);
    }

    try {
        publishPaymentEvent(event);
    } catch (err) {
        console.error('Failed to publish payment event:', err);
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}