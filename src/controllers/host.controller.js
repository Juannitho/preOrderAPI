import * as hostService from '../services/host.service.js';
import { TranslationUnavailableError, TranslationQuotaError, SUPPORTED_LANGUAGES } from '../services/deepl.service.js';
import * as paymentService from '../services/payment.service.js';
import { PaymentGatewayError } from '../services/payment.service.js';

// Controller functions for host operations
// Get preorder details for a specific booking
export async function getPreorder(req, res, next) {
    try {
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return next(err);
    }
}

// Get menu for a specific restaurant, including categories and available items
export async function getMenu(req, res, next) {
    try {
        const menu = await hostService.getMenu(req.preorder.booking.restaurantId);
        return res.json(menu);
    } catch (err) {
        return next(err);
    }
}

// Add a new item to the preorder
export async function addItem(req, res, next) {
    try {
        await hostService.addItem(req.preorder, req.body);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.status(201).json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return next(err);
    }
}

// Update an existing item in the preorder
export async function updateItem(req, res, next) {
    try {
        await hostService.updateItem(req.preorder.id, req.params.itemId, req.body);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return next(err);
    }
}

// Remove an item from the preorder
export async function removeItem(req, res, next) {
    try {
        await hostService.removeItem(req.preorder.id, req.params.itemId);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return next(err);
    }
}

// Translate Items in the preorder to a specified language
export async function getTranslatedMenu(req, res, next) {
    try {
        const lang = String(req.query.lang || '').toUpperCase();

        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            return res.status(400).json({
                error: 'Unsupported language',
                supported: SUPPORTED_LANGUAGES,
            });
        }

        const menu = await hostService.getTranslatedMenu(
            req.preorder.booking.restaurantId,
            lang
        );

        return res.json(menu);
    } catch (err) {
        if (err instanceof TranslationQuotaError) {
            return res.status(429).json({ error: err.message });
        }
        if (err instanceof TranslationUnavailableError) {
            return res.status(502).json({ error: err.message });
        }
        return next(err);
    }
}

// Checkout and payment processing for the preorder
export async function checkout(req, res, next) {
    try {
        const result = await paymentService.createCheckout(req.preorder);
        return res.status(201).json(result);
    } catch (err) {
        if (err instanceof PaymentGatewayError) {
            return res.status(502).json({ error: err.message });
        }
        return next(err);
    }
}