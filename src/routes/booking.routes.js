import { Router } from 'express';
import * as controller from '../controllers/booking.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema, updateBookingSchema } from '../schemas/booking.schema.js';

import * as preorderController from '../controllers/preorder.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validate(createBookingSchema), controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', validate(updateBookingSchema), controller.update);

// 
router.post('/:id/preorder', preorderController.create);

export default router;