import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { NotFoundError, ConflictError } from '../utils/httpErrors.js';
import { assertTransition, MANAGER_TRANSITIONS } from './preorderState.js';

// Preorder Service
// Constants for access code generation and default expiry
const ACCESS_CODE_BYTES = 24;
const DEFAULT_EXPIRY_DAYS = 14;

// Helper function to generate a secure random access code
function generateAccessCode() {
    return crypto.randomBytes(ACCESS_CODE_BYTES).toString('base64url');
}

// Function to create a new preorder for a booking
export async function createPreorder(restaurantId, bookingId) {
    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, restaurantId },
        select: { id: true, bookingDatetime: true },
    });

    if (!booking) throw new NotFoundError('Booking');

    const expiresAt = new Date(
        Math.min(
            booking.bookingDatetime.getTime(),
            Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        )
    );

    try {
        return await prisma.preorder.create({
            data: {
                bookingId: booking.id,
                accessCode: generateAccessCode(),
                status: 'OPEN',
                currency: 'AUD',
                expiresAt,
            },
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new ConflictError('This booking already has a pre-order');
        }
        throw err;
    }
}

// Get all preorders for a restaurant, optionally filtered by status
export async function listPreorders(restaurantId, { status } = {}) {
    return prisma.preorder.findMany({
        where: {
            booking: { restaurantId },
            ...(status ? { status } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
            booking: {
                select: { customerName: true, bookingDatetime: true, partySize: true },
            },
            _count: { select: { orderItems: true } },
        },
    });
}

// Function to get a preorder by ID for a restaurant
export async function getPreorderForManager(restaurantId, id) {
    const preorder = await prisma.preorder.findFirst({
        where: { id, booking: { restaurantId } },
        include: {
            booking: true,
            orderItems: { orderBy: { createdAt: 'asc' } },
            payments: { orderBy: { createdAt: 'desc' } },
        },
    });

    if (!preorder) throw new NotFoundError('Preorder');

    const totalCents = preorder.orderItems.reduce(
        (sum, item) => sum + item.unitPriceCents * item.quantity,
        0
    );

    return { ...preorder, totalCents };
}

// Function to update the status of a preorder for a restaurant
export async function updateStatus(restaurantId, id, nextStatus) {
    if (!MANAGER_TRANSITIONS.includes(nextStatus)) {
        throw new ConflictError(`Managers cannot set status to ${nextStatus}`);
    }

    const preorder = await prisma.preorder.findFirst({
        where: { id, booking: { restaurantId } },
        select: { id: true, status: true },
    });

    if (!preorder) throw new NotFoundError('Preorder');

    assertTransition(preorder.status, nextStatus);

    const updated = await prisma.preorder.updateMany({
        where: { id, status: preorder.status },
        data: { status: nextStatus },
    });

    if (updated.count === 0) {
        throw new ConflictError('Pre-order status changed, please retry');
    }

    return prisma.preorder.findUnique({ where: { id } });
}