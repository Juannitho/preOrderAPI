import { prisma } from '../config/db.js';
import { NotFoundError, ConflictError } from '../utils/httpErrors.js';

// Helper function to assert that a category belongs to the given restaurant
// Throws NotFoundError if the category does not belong to the restaurant
async function assertCategoryOwned(restaurantId, categoryId) {
    const category = await prisma.menuCategory.findFirst({
        where: { id: categoryId, restaurantId },
        select: { id: true },
    });
    if (!category) throw new NotFoundError('Category');
}

// List all menu items for a specific restaurant, optionally filtered by category and availability
export async function listItems(restaurantId, { categoryId, availableOnly } = {}) {
    return prisma.menuItem.findMany({
        where: {
            category: { restaurantId },
            ...(categoryId ? { categoryId } : {}),
            ...(availableOnly ? { isAvailable: true } : {}),
        },
        orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
        include: { category: { select: { id: true, name: true } } },
    });
}

// Get a single menu item for a specific restaurant
export async function getItem(restaurantId, id) {
    const item = await prisma.menuItem.findFirst({
        where: { id, category: { restaurantId } },
        include: { category: { select: { id: true, name: true } } },
    });

    if (!item) throw new NotFoundError('Menu item');
    return item;
}

// Service functions for menu item operations
// Function to create a menu item for a specific restaurant
export async function createItem(restaurantId, data) {
    await assertCategoryOwned(restaurantId, data.categoryId);
    return prisma.menuItem.create({ data });
}

// Function to update a menu item for a specific restaurant
export async function updateItem(restaurantId, id, data) {
    const existing = await prisma.menuItem.findFirst({
        where: { id, category: { restaurantId } },
        select: { id: true },
    });

    if (!existing) throw new NotFoundError('Menu item');

    if (data.categoryId) {
        await assertCategoryOwned(restaurantId, data.categoryId);
    }

    return prisma.menuItem.update({ where: { id }, data });
}

// Function to delete a menu item for a specific restaurant
export async function deleteItem(restaurantId, id) {
    const existing = await prisma.menuItem.findFirst({
        where: { id, category: { restaurantId } },
        include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) throw new NotFoundError('Menu item');

    if (existing._count.orderItems > 0) {
        throw new ConflictError(
            'This dish appears on existing orders. Set isAvailable to false instead.'
        );
    }

    await prisma.menuItem.delete({ where: { id } });
}