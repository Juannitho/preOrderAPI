import express, { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = Router();

/**
 * @openapi
 * /webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Stripe payment webhook
 *     description: >
 *       Called by Stripe, not by API clients. Authenticated via the `Stripe-Signature` header
 *       (HMAC over the raw body with the webhook signing secret) instead of a bearer token.
 *     security: []
 *     parameters:
 *       - in: header
 *         name: Stripe-Signature
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: A Stripe event object (raw body, signature-verified)
 *     responses:
 *       200:
 *         description: Event received (and processed, or ignored if not a handled type)
 *       400:
 *         description: Invalid/missing Stripe signature
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Failed to queue the event for processing
 */
router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

export default router;