import { z } from 'zod';

export const createBookingSchema = z.object({
    customerName: z.string().trim().min(1).max(120),
    customerEmail: z.string().trim().pipe(z.email().max(255)).optional().nullable(),
    customerPhone: z.string().trim().max(30).optional().nullable(),
    bookingDatetime: z.coerce.date(),
    partySize: z.number().int().positive().max(200),
});

export const updateBookingSchema = createBookingSchema.partial();