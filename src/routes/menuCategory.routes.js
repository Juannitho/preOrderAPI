import { Router } from 'express';
import * as controller from '../controllers/menuCategory.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/menuCategory.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validate(createCategorySchema), controller.create);
router.patch('/:id', validate(updateCategorySchema), controller.update);
router.delete('/:id', controller.remove);

export default router;