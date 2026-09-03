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

router.get('/:code', resolvePreorder, controller.getPreorder);
router.get('/:code/menu', resolvePreorder, controller.getMenu);
router.get('/:code/menu/translate', resolvePreorder, controller.getTranslatedMenu);

router.post(
    '/:code/items',
    resolvePreorder,
    requireOpen,
    validate(addItemSchema),
    controller.addItem
);

router.patch(
    '/:code/items/:itemId',
    resolvePreorder,
    requireOpen,
    validate(updateItemSchema),
    controller.updateItem
);

router.delete('/:code/items/:itemId', resolvePreorder, requireOpen, controller.removeItem);
router.post('/:code/checkout', resolvePreorder, requireOpen, controller.checkout);


export default router;