import { prisma } from '../config/db.js';
import { NotFoundError } from '../utils/httpErrors.js';

// Booking Service
// List bookings for a restaurant, optionally filtered by date range
export async function listBookings(restaurantId, { from, to } = {}) {
    return prisma.booking.findMany({
        where: {
            restaurantId,
            ...(from || to
                ? {
                    bookingDatetime: {
                        ...(from ? { gte: from } : {}),
                        ...(to ? { lte: to } : {}),
                    },
                }
                : {}),
        },
        orderBy: { bookingDatetime: 'asc' },
        include: {
            preorder: { select: { id: true, status: true, accessCode: true } },
        },
    });
}

// Get a single booking by ID
export async function getBooking(restaurantId, id) {
    const booking = await prisma.booking.findFirst({
        where: { id, restaurantId },
        include: {
            preorder: { select: { id: true, status: true, accessCode: true } },
            createdBy: { select: { id: true, name: true } },
        },
    });

    if (!booking) throw new NotFoundError('Booking');
    return booking;
}

// Create a new booking for a restaurant
export async function createBooking(restaurantId, userId, data) {
    return prisma.booking.create({
        data: {
            ...data,
            restaurantId,
            createdById: userId,
        },
    });
}

// Update an existing booking for a restaurant
export async function updateBooking(restaurantId, id, data) {
    const existing = await prisma.booking.findFirst({
        where: { id, restaurantId },
        select: { id: true },
    });

    if (!existing) throw new NotFoundError('Booking');

    return prisma.booking.update({ where: { id }, data });
}