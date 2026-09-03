import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/host.controller.js';
import { resolvePreorder, requireOpen } from '../middlewares/resolvePreorder.js';
import { validate } from '../middlewares/validate.js';
import { addItemSchema, updateItemSchema } from '../schemas/host.schema.js';

const router = Router();

const codeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests' },
});

router.use(codeLimiter);

router.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    next();
});

/**
 * @openapi
 * /p/{code}:
 *   get:
 *     tags: [Guest]
 *     summary: Get a pre-order by its access code
 *     description: No login required — the access code (from the booking's guest link) is the credential. Rate-limited to 100 req/15min per IP.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *     responses:
 *       200:
 *         description: The pre-order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GuestPreorderView' }
 *       404:
 *         description: No pre-order matches this code
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:code', resolvePreorder, controller.getPreorder);

/**
 * @openapi
 * /p/{code}/menu:
 *   get:
 *     tags: [Guest]
 *     summary: Get the restaurant's menu for this pre-order
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *     responses:
 *       200:
 *         description: Menu categories with their available items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - { $ref: '#/components/schemas/MenuCategory' }
 *                   - type: object
 *                     properties:
 *                       items:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/MenuItem' }
 *       404:
 *         description: No pre-order matches this code
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:code/menu', resolvePreorder, controller.getMenu);

/**
 * @openapi
 * /p/{code}/menu/translate:
 *   get:
 *     tags: [Guest]
 *     summary: Get the menu with ingredients machine-translated
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *       - in: query
 *         name: lang
 *         required: true
 *         schema: { type: string, example: ES }
 *         description: Target language code (ES, FR, DE, IT, PT-BR, JA, ZH, KO, NL, PL)
 *     responses:
 *       200:
 *         description: Menu categories with translated item ingredients
 *       400:
 *         description: Unsupported language
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No pre-order matches this code
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Translation quota exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       502:
 *         description: Translation service unavailable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:code/menu/translate', resolvePreorder, controller.getTranslatedMenu);

/**
 * @openapi
 * /p/{code}/items:
 *   post:
 *     tags: [Guest]
 *     summary: Add an item to the pre-order
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menuItemId, quantity]
 *             properties:
 *               menuItemId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1, maximum: 99 }
 *               notes: { type: string, maxLength: 500, nullable: true }
 *     responses:
 *       201:
 *         description: The updated pre-order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GuestPreorderView' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: No pre-order/menu item matches
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: This pre-order can no longer be changed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
    '/:code/items',
    resolvePreorder,
    requireOpen,
    validate(addItemSchema),
    controller.addItem
);

/**
 * @openapi
 * /p/{code}/items/{itemId}:
 *   patch:
 *     tags: [Guest]
 *     summary: Update an item's quantity/notes
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: At least one of quantity or notes is required
 *             properties:
 *               quantity: { type: integer, minimum: 1, maximum: 99 }
 *               notes: { type: string, maxLength: 500, nullable: true }
 *     responses:
 *       200:
 *         description: The updated pre-order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GuestPreorderView' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: No pre-order/order item matches
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: This pre-order can no longer be changed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
    '/:code/items/:itemId',
    resolvePreorder,
    requireOpen,
    validate(updateItemSchema),
    controller.updateItem
);

/**
 * @openapi
 * /p/{code}/items/{itemId}:
 *   delete:
 *     tags: [Guest]
 *     summary: Remove an item from the pre-order
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The updated pre-order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GuestPreorderView' }
 *       404:
 *         description: No pre-order/order item matches
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: This pre-order can no longer be changed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:code/items/:itemId', resolvePreorder, requireOpen, controller.removeItem);

/**
 * @openapi
 * /p/{code}/checkout:
 *   post:
 *     tags: [Guest]
 *     summary: Start payment for the pre-order (creates a Stripe PaymentIntent)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string, minLength: 16, maxLength: 64 }
 *     responses:
 *       201:
 *         description: PaymentIntent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret: { type: string, description: 'Stripe PaymentIntent client secret, for use with Stripe.js' }
 *                 paymentIntentId: { type: string }
 *                 amountCents: { type: integer }
 *                 currency: { type: string, example: AUD }
 *       404:
 *         description: No pre-order matches this code
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: This pre-order is not open, or is already paid, or has no items
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: This pre-order link has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       502:
 *         description: Payment provider unavailable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:code/checkout', resolvePreorder, requireOpen, controller.checkout);


export default router;