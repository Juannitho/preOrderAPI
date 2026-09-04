// Unit tests for the requireRole() authorization middleware factory —
// exercised with fake req/res/next objects, no JWTs and no database
// involved (that's requireAuth's job, already covered by an integration
// test in test/auth-me.test.js).
import { jest } from '@jest/globals';
import { requireRole } from '../src/middlewares/requireAuth.js';

function fakeRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

test('calls next() when the user has one of the allowed roles', () => {
    const req = { user: { role: 'MANAGER' } };
    const res = fakeRes();
    const next = jest.fn();

    requireRole('MANAGER', 'STAFF')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
});

test('responds 403 when the user is authenticated but lacks the role', () => {
    const req = { user: { role: 'STAFF' } };
    const res = fakeRes();
    const next = jest.fn();

    requireRole('MANAGER')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
});

test('responds 401 when there is no req.user at all (requireRole used without requireAuth first)', () => {
    const req = {};
    const res = fakeRes();
    const next = jest.fn();

    requireRole('MANAGER')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
});

test('a fresh middleware instance is returned per call, so role lists never leak between routes', () => {
    const managerOnly = requireRole('MANAGER');
    const staffToo = requireRole('MANAGER', 'STAFF');

    expect(managerOnly).not.toBe(staffToo);
});
