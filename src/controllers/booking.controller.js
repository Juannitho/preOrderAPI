import * as bookingService from '../services/booking.service.js';
import { handle } from '../utils/httpErrors.js';

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
        return handle(err, res, next);
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
        return handle(err, res, next);
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
        return handle(err, res, next);
    }
}

// Update an existing booking for a restaurant
export async function update(req, res, next) {
    try {
        const booking = await bookingService.updateBooking(
            req.user.restaurantId,
            req.params.id,
            req.body
        );
        return res.json(booking);
    } catch (err) {
        return handle(err, res, next);
    }
}