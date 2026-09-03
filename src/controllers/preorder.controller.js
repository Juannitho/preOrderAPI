import * as preorderService from '../services/preorder.service.js';
import { env } from '../config/env.js';

// Helper function to add an access link to a preorder object
function withLink(preorder) {
    return {
        ...preorder,
        accessLink: `${env.publicAppUrl}/p/${preorder.accessCode}`,
    };
}

// Controller functions for preorder operations
// Function to create a new preorder for a booking
export async function create(req, res, next) {
    try {
        const preorder = await preorderService.createPreorder(
            req.user.restaurantId,
            req.params.id
        );
        return res.status(201).json(withLink(preorder));
    } catch (err) {
        return next(err);
    }
}

// Get all preorders for a restaurant, optionally filtered by status
export async function list(req, res, next) {
    try {
        const preorders = await preorderService.listPreorders(req.user.restaurantId, {
            status: req.query.status,
        });
        return res.json(preorders);
    } catch (err) {
        return next(err);
    }
}

// Get a specific preorder by ID for a restaurant
export async function getOne(req, res, next) {
    try {
        const preorder = await preorderService.getPreorderForManager(
            req.user.restaurantId,
            req.params.id
        );
        return res.json(withLink(preorder));
    } catch (err) {
        return next(err);
    }
}

// Update the status of a specific preorder for a restaurant
export async function updateStatus(req, res, next) {
    try {
        const preorder = await preorderService.updateStatus(
            req.user.restaurantId,
            req.params.id,
            req.body.status
        );
        return res.json(preorder);
    } catch (err) {
        return next(err);
    }
}