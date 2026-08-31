import * as hostService from '../services/host.service.js';
import { handle } from '../utils/httpErrors.js';

// Controller functions for host operations
// Get preorder details for a specific booking
export async function getPreorder(req, res, next) {
    try {
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return handle(err, res, next);
    }
}

// Get menu for a specific restaurant, including categories and available items
export async function getMenu(req, res, next) {
    try {
        const menu = await hostService.getMenu(req.preorder.booking.restaurantId);
        return res.json(menu);
    } catch (err) {
        return handle(err, res, next);
    }
}

// Add a new item to the preorder
export async function addItem(req, res, next) {
    try {
        await hostService.addItem(req.preorder, req.body);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.status(201).json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return handle(err, res, next);
    }
}

// Update an existing item in the preorder
export async function updateItem(req, res, next) {
    try {
        await hostService.updateItem(req.preorder.id, req.params.itemId, req.body);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return handle(err, res, next);
    }
}

// Remove an item from the preorder
export async function removeItem(req, res, next) {
    try {
        await hostService.removeItem(req.preorder.id, req.params.itemId);
        const items = await hostService.getOrderItems(req.preorder.id);
        return res.json(hostService.toHostView(req.preorder, items));
    } catch (err) {
        return handle(err, res, next);
    }
}