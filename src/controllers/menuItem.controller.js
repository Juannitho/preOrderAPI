import * as itemService from '../services/menuItem.service.js';



// Controller functions for menu item operations
// List all menu items for a restaurant, optionally filtered by category and availability
export async function list(req, res, next) {
    try {
        const items = await itemService.listItems(req.user.restaurantId, {
            categoryId: req.query.categoryId,
            availableOnly: req.query.availableOnly === 'true',
        });
        return res.json(items);
    } catch (err) {
        return next(err);
    }
}

// Get a single menu item for a restaurant
export async function getOne(req, res, next) {
    try {
        const item = await itemService.getItem(req.user.restaurantId, req.params.id);
        return res.json(item);
    } catch (err) {
        return next(err);
    }
}

// Create a new menu item for a restaurant
export async function create(req, res, next) {
    try {
        const item = await itemService.createItem(req.user.restaurantId, req.body);
        return res.status(201).json(item);
    } catch (err) {
        return next(err);
    }
}

// Update an existing menu item for a restaurant
export async function update(req, res, next) {
    try {
        const item = await itemService.updateItem(
            req.user.restaurantId,
            req.params.id,
            req.body
        );
        return res.json(item);
    } catch (err) {
        return next(err);
    }
}

// Delete a menu item for a restaurant
export async function remove(req, res, next) {
    try {
        await itemService.deleteItem(req.user.restaurantId, req.params.id);
        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
}