import * as bookingService from '../services/booking.service.js';

// Booking Controller
// List bookings for a restaurant, optionally filtered by date range
export async function list(req, res, next) {
    try {
        const { from, to } = req.query;
        const bookings = await bookingService.listBookings(req.user.restaurantId, {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
        return res.json(bookings);
    } catch (err) {
        return next(err);
    }
}

// Get a single booking by ID
export async function getOne(req, res, next) {
    try {
        const booking = await bookingService.getBooking(
            req.user.restaurantId,
            req.params.id
        );
        return res.json(booking);
    } catch (err) {
        return next(err);
    }
}

// Create a new booking for a restaurant
export async function create(req, res, next) {
    try {
        const booking = await bookingService.createBooking(
            req.user.restaurantId,
            req.user.sub,
            req.body
        );
        return res.status(201).json(booking);
    } catch (err) {
        return next(err);
    }
}

// Update an existing booking for a restaurant (partial — PATCH)
export async function update(req, res, next) {
    try {
        const booking = await bookingService.updateBooking(
            req.user.restaurantId,
            req.params.id,
            req.body
        );
        return res.json(booking);
    } catch (err) {
        return next(err);
    }
}

// Replace an existing booking for a restaurant (full representation — PUT).
// Body is validated against the full (non-partial) schema, so every field is
// required; the underlying update is the same, just always given every field.
export async function replace(req, res, next) {
    try {
        const booking = await bookingService.updateBooking(
            req.user.restaurantId,
            req.params.id,
            req.body
        );
        return res.json(booking);
    } catch (err) {
        return next(err);
    }
}