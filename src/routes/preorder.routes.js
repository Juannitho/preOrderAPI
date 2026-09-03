import { Router } from 'express';
import * as controller from '../controllers/preorder.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { updateStatusSchema } from '../schemas/preorder.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus);

export default router;