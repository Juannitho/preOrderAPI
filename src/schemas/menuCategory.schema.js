import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().trim().min(1).max(80),
    sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();