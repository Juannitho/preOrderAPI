import { Router } from 'express';
import * as controller from '../controllers/menuItem.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createItemSchema, updateItemSchema } from '../schemas/menuItem.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validate(createItemSchema), controller.create);
router.patch('/:id', validate(updateItemSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;