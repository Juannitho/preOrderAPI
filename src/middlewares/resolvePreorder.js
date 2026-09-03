import { prisma } from '../config/db.js';
import { EDITABLE_STATUSES } from '../services/preorderState.js';

export async function resolvePreorder(req, res, next) {
    try {
        const { code } = req.params;

        if (typeof code !== 'string' || code.length < 16 || code.length > 64) {
            return res.status(404).json({ error: 'Not found' });
        }

        const preorder = await prisma.preorder.findUnique({
            where: { accessCode: code },
            include: {
                booking: {
                    select: {
                        customerName: true,
                        bookingDatetime: true,
                        partySize: true,
                        restaurantId: true,
                    },
                },
            },
        });

        if (!preorder) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (preorder.expiresAt && preorder.expiresAt < new Date()) {
            return res.status(410).json({ error: 'This pre-order link has expired' });
        }

        req.preorder = preorder;
        return next();
    } catch (err) {
        return next(err);
    }
}

// Middleware to ensure the preorder is still open for modifications
export function requireOpen(req, res, next) {
    if (!EDITABLE_STATUSES.includes(req.preorder.status)) {
        return res.status(409).json({
            error: `This pre-order is ${req.preorder.status.toLowerCase()} and can no longer be changed`,
        });
    }
    return next();
}