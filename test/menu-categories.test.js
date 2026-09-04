// Integration test for GET /api/categories — a real, DB-backed (mocked)
// list endpoint behind requireAuth, scoped to the caller's restaurant.
import { test, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../src/config/env.js';

let app;
let mockCategories = [];

before(async () => {
    mock.module('../src/config/db.js', {
        namedExports: {
            prisma: {
                menuCategory: {
                    findMany: async ({ where: { restaurantId } }) =>
                        mockCategories.filter((c) => c.restaurantId === restaurantId),
                },
            },
            connectDB: async () => {},
            disconnectDB: async () => {},
        },
    });

    ({ default: app } = await import('../src/app.js'));
});

function tokenFor(restaurantId) {
    return jwt.sign({ sub: 'user-1', role: 'MANAGER', restaurantId }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });
}

test('GET /api/categories — no token returns 401', async () => {
    const res = await request(app).get('/api/categories');

    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Missing or malformed token' });
});

test('GET /api/categories — returns only the caller\'s restaurant\'s categories', async () => {
    mockCategories = [
        { id: 'cat-1', restaurantId: 'restaurant-1', name: 'Antipasti', sortOrder: 0 },
        { id: 'cat-2', restaurantId: 'restaurant-1', name: 'Dolci', sortOrder: 1 },
        { id: 'cat-3', restaurantId: 'restaurant-2', name: 'Someone else\'s category', sortOrder: 0 },
    ];

    const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenFor('restaurant-1')}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    assert.deepEqual(
        res.body.map((c) => c.name),
        ['Antipasti', 'Dolci']
    );
});

test('GET /api/categories — restaurant with no categories returns an empty array', async () => {
    mockCategories = [];

    const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenFor('restaurant-1')}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
});
