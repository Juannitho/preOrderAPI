// Integration test for GET /api/auth/me — exercises requireAuth (401 without
// a token) and the authenticated happy path, against a mocked database.
import { test, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../src/config/env.js';

let app;
let mockUser = null;

before(async () => {
    mock.module('../src/config/db.js', {
        namedExports: {
            prisma: {
                user: {
                    findUnique: async ({ where: { id } }) =>
                        mockUser && mockUser.id === id ? mockUser : null,
                },
            },
            connectDB: async () => {},
            disconnectDB: async () => {},
        },
    });

    ({ default: app } = await import('../src/app.js'));
});

test('GET /api/auth/me — no token returns 401 { error }', async () => {
    const res = await request(app).get('/api/auth/me');

    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Missing or malformed token' });
});

test('GET /api/auth/me — malformed token returns 401', async () => {
    const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-token');

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid token');
});

test('GET /api/auth/me — valid token returns the current user', async () => {
    mockUser = {
        id: 'user-1',
        name: 'Test Manager',
        email: 'manager@trattoria.test',
        role: 'MANAGER',
        restaurantId: 'restaurant-1',
    };

    const token = jwt.sign(
        { sub: mockUser.id, role: mockUser.role, restaurantId: mockUser.restaurantId },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );

    const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, mockUser);
});
