// Unit tests for the validate() middleware factory — exercised with a real
// Zod schema and hand-rolled fake req/res/next objects, no Express server
// and no database involved.
import { jest } from '@jest/globals';
import { z } from 'zod';
import { validate } from '../src/middlewares/validate.js';

const schema = z.object({
    name: z.string().trim().min(1).max(50),
    quantity: z.number().int().positive(),
});

function fakeRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

test('calls next() and replaces req.body with the parsed data on valid input', () => {
    const req = { body: { name: '  Margherita  ', quantity: 2 } };
    const res = fakeRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    // trim() ran as part of the schema, so the stored body reflects that
    expect(req.body).toEqual({ name: 'Margherita', quantity: 2 });
});

test('responds 400 with field-level details and never calls next() on invalid input', () => {
    const req = { body: { name: '', quantity: -1 } };
    const res = fakeRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);

    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toBe('Validation failed');
    expect(payload.details).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'quantity' }),
        ])
    );
});

test('rejects a missing required field', () => {
    const req = { body: { name: 'Only a name' } };
    const res = fakeRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'quantity' })])
    );
});
