import { prisma } from '../config/db.js';
import { NotFoundError, ConflictError } from '../utils/httpErrors.js';
import { translateBatch } from './deepl.service.js';


// Helper function to calculate the total cost of order items
function calculateTotal(orderItems) {
    return orderItems.reduce(
        (sum, item) => sum + item.unitPriceCents * item.quantity,
        0
    );
}

// Function to transform a preorder and its order items into a view suitable for the host
export function toHostView(preorder, orderItems) {
    return {
        customerName: preorder.booking.customerName,
        bookingDatetime: preorder.booking.bookingDatetime,
        partySize: preorder.booking.partySize,
        status: preorder.status,
        currency: preorder.currency,
        expiresAt: preorder.expiresAt,
        items: orderItems.map((i) => ({
            id: i.id,
            menuItemId: i.menuItemId,
            name: i.itemName,
            unitPriceCents: i.unitPriceCents,
            quantity: i.quantity,
            lineTotalCents: i.unitPriceCents * i.quantity,
            notes: i.notes,
        })),
        totalCents: calculateTotal(orderItems),
    };
}

// Get all order items for a specific preorder
export async function getOrderItems(preorderId) {
    return prisma.orderItem.findMany({
        where: { preorderId },
        orderBy: { createdAt: 'asc' },
    });
}

// Get menu for a specific restaurant, including categories and available items
export async function getMenu(restaurantId) {
    return prisma.menuCategory.findMany({
        where: { restaurantId },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
            items: {
                where: { isAvailable: true },
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    ingredients: true,
                    priceCents: true,
                },
            },
        },
    });
}

export async function addItem(preorder, { menuItemId, quantity, notes }) {
    const menuItem = await prisma.menuItem.findFirst({
        where: {
            id: menuItemId,
            isAvailable: true,
            category: { restaurantId: preorder.booking.restaurantId },
        },
    });

    if (!menuItem) throw new NotFoundError('Menu item');

    return prisma.orderItem.create({
        data: {
            preorderId: preorder.id,
            menuItemId: menuItem.id,
            itemName: menuItem.name,
            unitPriceCents: menuItem.priceCents,
            quantity,
            notes: notes ?? null,
        },
    });
}

export async function updateItem(preorderId, itemId, { quantity, notes }) {
    const result = await prisma.orderItem.updateMany({
        where: { id: itemId, preorderId },
        data: {
            ...(quantity !== undefined ? { quantity } : {}),
            ...(notes !== undefined ? { notes } : {}),
        },
    });

    if (result.count === 0) throw new NotFoundError('Order item');

    return prisma.orderItem.findUnique({ where: { id: itemId } });
}

export async function removeItem(preorderId, itemId) {
    const result = await prisma.orderItem.deleteMany({
        where: { id: itemId, preorderId },
    });

    if (result.count === 0) throw new NotFoundError('Order item');
}

// Function to get the translated menu in a target language
export async function getTranslatedMenu(restaurantId, targetLang) {
    const menu = await getMenu(restaurantId);
    const flatItems = menu.flatMap((category) => category.items);

    if (flatItems.length === 0) return menu;

    const translations = await translateBatch(
        flatItems.map((item) => item.ingredients),
        targetLang
    );

    const byId = new Map(
        flatItems.map((item, i) => [item.id, translations[i]])
    );

    return menu.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
            ...item,
            ingredientsTranslated: byId.get(item.id),
            translatedTo: targetLang,
        })),
    }));
}

// export { SUPPORTED_LANGUAGES };