import * as categoryService from '../services/menuCategory.service.js';
import { handle } from '../utils/httpErrors.js';

// Controller functions for menu category operations
// List all categories for a restaurant
export async function list(req, res, next) {
    try {
        const categories = await categoryService.listCategories(req.user.restaurantId);
        return res.json(categories);
    } catch (err) {
        return handle(err, res, next);
    }
}

// Create a new category for a restaurant
export async function create(req, res, next) {
    try {
        const category = await categoryService.createCategory(req.user.restaurantId, req.body);
        return res.status(201).json(category);
    } catch (err) {
        return handle(err, res, next);
    }
}

// Update an existing category for a restaurant
export async function update(req, res, next) {
    try {
        const category = await categoryService.updateCategory(
            req.user.restaurantId,
            req.params.id,
            req.body
        );
        return res.json(category);
    } catch (err) {
        return handle(err, res, next);
    }
}

// Delete a category for a restaurant
export async function remove(req, res, next) {
    try {
        await categoryService.deleteCategory(req.user.restaurantId, req.params.id);
        return res.sendStatus(204);
    } catch (err) {
        return handle(err, res, next);
    }
}