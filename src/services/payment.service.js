import { prisma } from '../config/db.js';
import { stripe } from '../config/stripe.js';
import { ConflictError, NotFoundError } from '../utils/httpErrors.js';
import { assertTransition } from './preorderState.js';

export class PaymentGatewayError extends Error {
    constructor(message = 'Payment provider unavailable') {
        super(message);
        this.name = 'PaymentGatewayError';
    }
}

export async function createCheckout(preorder) {
    if (preorder.status !== 'OPEN') {
        throw new ConflictError(`This pre-order is ${preorder.status.toLowerCase()}`);
    }

    const items = await prisma.orderItem.findMany({
        where: { preorderId: preorder.id },
    });

    if (items.length === 0) {
        throw new ConflictError('Cannot pay for an empty pre-order');
    }

    const amountCents = items.reduce(
        (sum, i) => sum + i.unitPriceCents * i.quantity,
        0
    );

    const existing = await prisma.payment.findFirst({
        where: { preorderId: preorder.id, status: 'SUCCEEDED' },
    });

    if (existing) {
        throw new ConflictError('This pre-order has already been paid');
    }

    let intent;
    try {
        intent = await stripe.paymentIntents.create(
            {
                amount: amountCents,
                currency: preorder.currency.toLowerCase(),
                metadata: {
                    preorderId: preorder.id,
                    bookingId: preorder.bookingId,
                },
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                },
            },
            { idempotencyKey: `preorder-${preorder.id}-${amountCents}` }
        );
    } catch (err) {
        throw new PaymentGatewayError(err.message);
    }

    await prisma.payment.create({
        data: {
            preorderId: preorder.id,
            stripePaymentIntentId: intent.id,
            amountCents,
            currency: preorder.currency,
            status: 'PENDING',
        },
    });

    return {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amountCents,
        currency: preorder.currency,
    };
}

// This function is called by the webhook controller to process Stripe events
export async function recordStripeEvent(event) {
    const intent = event.data.object;
    const succeeded = event.type === 'payment_intent.succeeded';

    try {
        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { stripePaymentIntentId: intent.id },
            });

            if (!payment) throw new NotFoundError('Payment');

            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    stripeEventId: event.id,
                    status: succeeded ? 'SUCCEEDED' : 'FAILED',
                    failureReason: succeeded
                        ? null
                        : intent.last_payment_error?.message ?? 'Payment failed',
                },
            });

            if (succeeded) {
                const preorder = await tx.preorder.findUnique({
                    where: { id: payment.preorderId },
                    select: { status: true },
                });

                assertTransition(preorder.status, 'PAID');

                await tx.preorder.update({
                    where: { id: payment.preorderId },
                    data: { status: 'PAID' },
                });
            }
        });
    } catch (err) {
        if (err.code === 'P2002') return;   // duplicate event, already processed
        if (err.name === 'ConflictError') return;  // already PAID
        throw err;
    }
}

export async function recordQueuedPaymentEvent(job) {
    const succeeded = job.eventType === 'payment_intent.succeeded';

    try {
        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { stripePaymentIntentId: job.paymentIntentId },
            });

            if (!payment) throw new NotFoundError('Payment');

            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    stripeEventId: job.eventId,
                    status: succeeded ? 'SUCCEEDED' : 'FAILED',
                    failureReason: succeeded ? null : job.failureMessage ?? 'Payment failed',
                },
            });

            if (succeeded) {
                const preorder = await tx.preorder.findUnique({
                    where: { id: payment.preorderId },
                    select: { status: true },
                });

                assertTransition(preorder.status, 'PAID');

                await tx.preorder.update({
                    where: { id: payment.preorderId },
                    data: { status: 'PAID' },
                });
            }
        });
    } catch (err) {
        if (err.code === 'P2002') return;
        if (err.name === 'ConflictError') return;
        throw err;
    }
}