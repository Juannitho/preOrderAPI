import { Router } from 'express';
import * as controller from '../controllers/menuItem.controller.js';
import { requireAuth, requireRole } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createItemSchema, updateItemSchema } from '../schemas/menuItem.schema.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/menu/items:
 *   get:
 *     tags: [Menu Items]
 *     summary: List menu items for the caller's restaurant
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *         description: Filter by category
 *       - in: query
 *         name: availableOnly
 *         schema: { type: boolean }
 *         description: Only return available items
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/MenuItem' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/menu/items/{id}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Get a single menu item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The menu item
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItem' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /api/menu/items:
 *   post:
 *     tags: [Menu Items]
 *     summary: Create a menu item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, priceCents]
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               name: { type: string, maxLength: 120 }
 *               description: { type: string, maxLength: 2000, nullable: true }
 *               ingredients: { type: string, maxLength: 2000, nullable: true }
 *               priceCents: { type: integer, minimum: 1, maximum: 100000 }
 *               isAvailable: { type: boolean }
 *     responses:
 *       201:
 *         description: Menu item created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItem' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createItemSchema), controller.create);

/**
 * @openapi
 * /api/menu/items/{id}:
 *   patch:
 *     tags: [Menu Items]
 *     summary: Update a menu item
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
 *             description: All fields optional — same shape as create, partial
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               name: { type: string, maxLength: 120 }
 *               description: { type: string, maxLength: 2000, nullable: true }
 *               ingredients: { type: string, maxLength: 2000, nullable: true }
 *               priceCents: { type: integer, minimum: 1, maximum: 100000 }
 *               isAvailable: { type: boolean }
 *     responses:
 *       200:
 *         description: The updated menu item
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItem' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', validate(updateItemSchema), controller.update);

/**
 * @openapi
 * /api/menu/items/{id}:
 *   delete:
 *     tags: [Menu Items]
 *     summary: Delete a menu item
 *     description: Manager-only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Menu item deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireRole('MANAGER'), controller.remove);

export default router;