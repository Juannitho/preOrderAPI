import { Router } from 'express';
import * as controller from '../controllers/booking.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema, updateBookingSchema } from '../schemas/booking.schema.js';

import * as preorderController from '../controllers/preorder.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings for the caller's restaurant
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *         description: Only bookings at/after this datetime
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *         description: Only bookings at/before this datetime
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, bookingDatetime, partySize]
 *             properties:
 *               customerName: { type: string, maxLength: 120 }
 *               customerEmail: { type: string, format: email, nullable: true }
 *               customerPhone: { type: string, maxLength: 30, nullable: true }
 *               bookingDatetime: { type: string, format: date-time }
 *               partySize: { type: integer, minimum: 1, maximum: 200 }
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createBookingSchema), controller.create);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get a single booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /api/bookings/{id}:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update a booking
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
 *               customerName: { type: string, maxLength: 120 }
 *               customerEmail: { type: string, format: email, nullable: true }
 *               customerPhone: { type: string, maxLength: 30, nullable: true }
 *               bookingDatetime: { type: string, format: date-time }
 *               partySize: { type: integer, minimum: 1, maximum: 200 }
 *     responses:
 *       200:
 *         description: The updated booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', validate(updateBookingSchema), controller.update);

/**
 * @openapi
 * /api/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Replace a booking (full representation)
 *     description: Unlike PATCH, every field is required — this replaces the whole record rather than merging a partial one.
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
 *             required: [customerName, bookingDatetime, partySize]
 *             properties:
 *               customerName: { type: string, maxLength: 120 }
 *               customerEmail: { type: string, format: email, nullable: true }
 *               customerPhone: { type: string, maxLength: 30, nullable: true }
 *               bookingDatetime: { type: string, format: date-time }
 *               partySize: { type: integer, minimum: 1, maximum: 200 }
 *     responses:
 *       200:
 *         description: The replaced booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', validate(createBookingSchema), controller.replace);

/**
 * @openapi
 * /api/bookings/{id}/preorder:
 *   post:
 *     tags: [Bookings, Preorders]
 *     summary: Create a pre-order for a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Booking ID
 *     responses:
 *       201:
 *         description: The created pre-order, including its guest access link
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Preorder' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/:id/preorder', preorderController.create);

export default router;