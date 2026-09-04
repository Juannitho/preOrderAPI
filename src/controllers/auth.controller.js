import * as authService from '../services/auth.service.js';
import { InvalidCredentialsError } from '../services/auth.service.js';

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res
                .status(400)
                .json({ error: 'Email and password are required' });
        }

        const result = await authService.login(email.trim().toLowerCase(), password);
        return res.json(result);
    } catch (err) {
        if (err instanceof InvalidCredentialsError) {
            return res
                .status(401)
                .json({ error: 'Invalid credentials' });
        }
        return next(err);
    }
}

// Manager-only: add a new staff/manager user to the caller's own restaurant.
export async function register(req, res, next) {
    try {
        const user = await authService.register(req.user.restaurantId, req.body);
        return res.status(201).json(user);
    } catch (err) {
        return next(err);
    }
}

export async function me(req, res, next) {
    try {
        const user = await authService.getUserById(req.user.sub);

        if (!user) {
            return res
                .status(401)
                .json({ error: 'User no longer exists' });
        }

        return res.json(user);
    } catch (err) {
        return next(err);
    }
}