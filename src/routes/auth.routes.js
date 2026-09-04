import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../schemas/auth.schema.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: manager@trattoria.test }
 *               password: { type: string, format: password, example: Manager123! }
 *     responses:
 *       200:
 *         description: Login succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string, description: JWT bearer token }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     email: { type: string, format: email }
 *                     name: { type: string }
 *                     role: { type: string, enum: [MANAGER, STAFF] }
 *       400:
 *         description: Email and/or password missing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Add a new staff/manager user to your restaurant
 *     description: Manager-only. Creates a user scoped to the caller's own restaurant — there is no public self-signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password, minLength: 8, maxLength: 72 }
 *               name: { type: string, maxLength: 120 }
 *               role: { type: string, enum: [MANAGER, STAFF], default: STAFF }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 email: { type: string, format: email }
 *                 name: { type: string }
 *                 role: { type: string, enum: [MANAGER, STAFF] }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: A user with that email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/register', requireAuth, requireRole('MANAGER'), validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the logged-in user
 *     responses:
 *       200:
 *         description: The current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 email: { type: string, format: email }
 *                 name: { type: string }
 *                 role: { type: string, enum: [MANAGER, STAFF] }
 *                 restaurantId: { type: string, format: uuid }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', requireAuth, authController.me);

export default router;