import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Fixed dev access code so you can hit /p/:code immediately after seeding.
// Real codes are generated with crypto.randomBytes(24) — this one is dev-only.
const DEV_ACCESS_CODE = 'J7k3n9L4m2P8q1R5';

async function clear() {
    // Reverse dependency order. Cascades would handle most of this, but
    // menu_item -> order_item is RESTRICT, so order_items must go first.
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.preorder.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();
}

async function main() {
    await clear();

    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Maccaroni Trattoria',
            timezone: 'Australia/Melbourne',
        },
    });

    const passwordHash = await bcrypt.hash('Manager123!', 12);

    const manager = await prisma.user.create({
        data: {
            restaurantId: restaurant.id,
            email: 'manager@trattoria.test',
            passwordHash,
            name: 'Sofia Ricci',
            role: 'MANAGER',
        },
    });

    // Nested writes: one call creates the category and all of its items,
    // inside a single transaction. If any item fails, the category rolls back.
    await prisma.menuCategory.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Antipasti',
            sortOrder: 1,
            items: {
                create: [
                    {
                        name: 'Bruschetta al Pomodoro',
                        description: 'Grilled sourdough with a fresh tomato topping.',
                        ingredients: 'sourdough bread, tomato, garlic, basil, olive oil, sea salt',
                        priceCents: 1600,
                    },
                    {
                        name: 'Arancini',
                        description: 'Fried risotto balls with a molten centre.',
                        ingredients: 'arborio rice, mozzarella, peas, breadcrumbs, egg, parmesan',
                        priceCents: 1800,
                    },
                    {
                        name: 'Burrata',
                        description: 'Creamy burrata served with seasonal accompaniments.',
                        ingredients: 'burrata cheese, heirloom tomato, basil, olive oil, balsamic vinegar',
                        priceCents: 2200,
                    },
                ],
            },
        },
    });

    const mains = await prisma.menuCategory.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Primi',
            sortOrder: 2,
            items: {
                create: [
                    {
                        name: 'Spaghetti alla Carbonara',
                        description: 'The Roman classic, no cream.',
                        ingredients: 'spaghetti, guanciale, egg yolk, pecorino romano, black pepper',
                        priceCents: 2600,
                    },
                    {
                        name: 'Lasagne alla Bolognese',
                        description: 'Slow-cooked ragu layered with pasta and bechamel.',
                        ingredients: 'pasta sheets, beef mince, pork mince, tomato, milk, butter, flour, nutmeg, parmesan',
                        priceCents: 2800,
                    },
                    {
                        name: 'Risotto ai Funghi',
                        description: 'Mushroom risotto finished with butter and parmesan.',
                        ingredients: 'arborio rice, porcini mushroom, shallot, white wine, vegetable stock, butter, parmesan',
                        priceCents: 2700,
                    },
                    {
                        name: 'Gnocchi al Pesto',
                        description: 'Potato gnocchi with basil pesto.',
                        ingredients: 'potato, flour, egg, basil, pine nuts, garlic, parmesan, olive oil',
                        priceCents: 2500,
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.menuCategory.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Dolci',
            sortOrder: 3,
            items: {
                create: [
                    {
                        name: 'Tiramisu',
                        description: 'Made in house daily.',
                        ingredients: 'mascarpone, egg, savoiardi biscuits, espresso, cocoa powder, sugar',
                        priceCents: 1400,
                    },
                    {
                        name: 'Panna Cotta',
                        description: 'Set cream with a berry coulis.',
                        ingredients: 'cream, milk, sugar, vanilla bean, gelatine, mixed berries',
                        priceCents: 1300,
                    },
                ],
            },
        },
    });

    // A booking with an open pre-order, so the host flow is testable right away.
    const booking = await prisma.booking.create({
        data: {
            restaurantId: restaurant.id,
            createdById: manager.id,
            customerName: 'Daniel Okafor',
            customerEmail: 'daniel@example.test',
            customerPhone: '+61400000000',
            bookingDatetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
            partySize: 14,
        },
    });

    const preorder = await prisma.preorder.create({
        data: {
            bookingId: booking.id,
            accessCode: DEV_ACCESS_CODE,
            status: 'OPEN',
            currency: 'AUD',
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
    });

    // Two lines already on the order, with prices snapshotted from the menu.
    const carbonara = mains.items.find((i) => i.name === 'Spaghetti alla Carbonara');
    const risotto = mains.items.find((i) => i.name === 'Risotto ai Funghi');

    await prisma.orderItem.createMany({
        data: [
            {
                preorderId: preorder.id,
                menuItemId: carbonara.id,
                itemName: carbonara.name,
                unitPriceCents: carbonara.priceCents,
                quantity: 4,
                notes: null,
            },
            {
                preorderId: preorder.id,
                menuItemId: risotto.id,
                itemName: risotto.name,
                unitPriceCents: risotto.priceCents,
                quantity: 3,
                notes: 'One without parmesan please',
            },
        ],
    });

    console.log('Seed complete.');
    console.log(`  manager login : manager@trattoria.test / Manager123!`);
    console.log(`  preorder link : /p/${DEV_ACCESS_CODE}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });