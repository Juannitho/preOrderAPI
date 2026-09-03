import { Router } from 'express';
import * as controller from '../controllers/preorder.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { updateStatusSchema } from '../schemas/preorder.schema.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/preorders:
 *   get:
 *     tags: [Preorders]
 *     summary: List pre-orders for the caller's restaurant
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, PAID, ORDERED, DELIVERED, COMPLETED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of pre-orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Preorder' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/preorders/{id}:
 *   get:
 *     tags: [Preorders]
 *     summary: Get a single pre-order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The pre-order, including its guest access link
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Preorder' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /api/preorders/{id}/status:
 *   patch:
 *     tags: [Preorders]
 *     summary: Update a pre-order's status
 *     description: Only certain status transitions are valid (see the pre-order state machine); an invalid transition returns 409.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ORDERED, DELIVERED, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: The updated pre-order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Preorder' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus);

export default router;