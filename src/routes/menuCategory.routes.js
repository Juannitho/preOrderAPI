import { Router } from 'express';
import * as controller from '../controllers/menuCategory.controller.js';
import { requireAuth, requireRole } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/menuCategory.schema.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Menu Categories]
 *     summary: List menu categories for the caller's restaurant
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/MenuCategory' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     tags: [Menu Categories]
 *     summary: Get a single menu category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The category
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuCategory' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     tags: [Menu Categories]
 *     summary: Create a menu category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 80 }
 *               sortOrder: { type: integer, minimum: 0 }
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuCategory' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createCategorySchema), controller.create);

/**
 * @openapi
 * /api/categories/{id}:
 *   patch:
 *     tags: [Menu Categories]
 *     summary: Update a menu category
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
 *             properties:
 *               name: { type: string, maxLength: 80 }
 *               sortOrder: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: The updated category
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuCategory' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', validate(updateCategorySchema), controller.update);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     tags: [Menu Categories]
 *     summary: Delete a menu category
 *     description: Manager-only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireRole('MANAGER'), controller.remove);

export default router;