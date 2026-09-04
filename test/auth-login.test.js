// Integration test for POST /api/auth/login.
//
// The database is mocked entirely (node:test's native module mocking) — no
// Postgres needed to run this. bcrypt and jsonwebtoken run for real, so the
// actual password check and token issuing are genuinely exercised.
import { test, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import request from 'supertest';

let app;
let mockUser = null;

before(async () => {
    // Intercept src/config/db.js everywhere it's imported (including
    // transitively, from auth.service.js) — must happen before the first
    // import of app.js below.
    mock.module('../src/config/db.js', {
        namedExports: {
            prisma: {
                user: {
                    findUnique: async ({ where: { email } }) =>
                        mockUser && mockUser.email === email ? mockUser : null,
                },
            },
            connectDB: async () => {},
            disconnectDB: async () => {},
        },
    });

    ({ default: app } = await import('../src/app.js'));
});

test('POST /api/auth/login — correct credentials returns a token and the user', async () => {
    mockUser = {
        id: 'user-1',
        restaurantId: 'restaurant-1',
        email: 'manager@trattoria.test',
        passwordHash: await bcrypt.hash('Manager123!', 12),
        name: 'Test Manager',
        role: 'MANAGER',
    };

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'manager@trattoria.test', password: 'Manager123!' });

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, 'string');
    assert.deepEqual(res.body.user, {
        id: 'user-1',
        name: 'Test Manager',
        email: 'manager@trattoria.test',
        role: 'MANAGER',
    });
});

test('POST /api/auth/login — wrong password returns 401 { error }', async () => {
    mockUser = {
        id: 'user-1',
        restaurantId: 'restaurant-1',
        email: 'manager@trattoria.test',
        passwordHash: await bcrypt.hash('Manager123!', 12),
        name: 'Test Manager',
        role: 'MANAGER',
    };

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'manager@trattoria.test', password: 'wrong-password' });

    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Invalid credentials' });
});

test('POST /api/auth/login — unknown email returns 401 { error }', async () => {
    mockUser = null;

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@trattoria.test', password: 'whatever' });

    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Invalid credentials' });
});
