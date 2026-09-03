import { z } from 'zod';

export const updateStatusSchema = z.object({
    status: z.enum(['ORDERED', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
});