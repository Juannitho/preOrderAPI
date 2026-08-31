import { z } from 'zod';

export const createItemSchema = z.object({
    categoryId: z.uuid(),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional().nullable(),
    ingredients: z.string().trim().max(2000).optional().nullable(),
    priceCents: z.number().int().positive().max(100000),
    isAvailable: z.boolean().optional(),
});

export const updateItemSchema = createItemSchema.partial();