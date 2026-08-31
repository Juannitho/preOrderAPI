import { z } from 'zod';

export const addItemSchema = z.object({
    menuItemId: z.uuid(),
    quantity: z.number().int().positive().max(99),
    notes: z.string().trim().max(500).optional().nullable(),
});

export const updateItemSchema = z
    .object({
        quantity: z.number().int().positive().max(99).optional(),
        notes: z.string().trim().max(500).optional().nullable(),
    })
    .refine((d) => d.quantity !== undefined || d.notes !== undefined, {
        message: 'Provide at least one of quantity or notes',
    });