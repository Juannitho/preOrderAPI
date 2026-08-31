import { prisma } from '../config/db.js';
import { NotFoundError, ConflictError } from '../utils/httpErrors.js';

// Service functions for menu category operations
// Function to list all categories for a specific restaurant
export async function listCategories(restaurantId) {
    return prisma.menuCategory.findMany({
        where: { restaurantId },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
}

// Function to create a category for a specific restaurant
export async function createCategory(restaurantId, data) {
    try {
        return await prisma.menuCategory.create({
            data: { restaurantId, name: data.name, sortOrder: data.sortOrder ?? 0 },
        });
    } catch (err) {
        // Handle unique constraint violation (P2002) for category name
        if (err.code === 'P2002') {
            throw new ConflictError('A category with that name already exists');
        }
        throw err;
    }
}

// Function to update a category by ID and restaurant ID
export async function updateCategory(restaurantId, id, data) {
    const existing = await prisma.menuCategory.findFirst({
        where: { id, restaurantId },
    });

    if (!existing) throw new NotFoundError('Category');

    try {
        return await prisma.menuCategory.update({ where: { id }, data });
    } catch (err) {
        // Handle unique constraint violation (P2002) for category name
        if (err.code === 'P2002') {
            throw new ConflictError('A category with that name already exists');
        }
        throw err;
    }
}

// Function to delete a category by ID and restaurant ID
export async function deleteCategory(restaurantId, id) {
    const existing = await prisma.menuCategory.findFirst({
        where: { id, restaurantId },
        include: { _count: { select: { items: true } } },
    });

    if (!existing) throw new NotFoundError('Category');

    if (existing._count.items > 0) {
        throw new ConflictError('Cannot delete a category that still has items');
    }

    await prisma.menuCategory.delete({ where: { id } });
}