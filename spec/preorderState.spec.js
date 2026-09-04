// Unit tests for the pre-order status state machine — pure logic, no
// database, no Express, no mocking needed.
import { canTransition, assertTransition } from '../src/services/preorderState.js';

describe('canTransition', () => {
    test('allows a valid forward move (OPEN -> PAID)', () => {
        expect(canTransition('OPEN', 'PAID')).toBe(true);
    });

    test('rejects skipping a step (OPEN -> ORDERED)', () => {
        expect(canTransition('OPEN', 'ORDERED')).toBe(false);
    });

    test('rejects moving out of a terminal state (COMPLETED -> OPEN)', () => {
        expect(canTransition('COMPLETED', 'OPEN')).toBe(false);
    });

    test('rejects an unknown starting state', () => {
        expect(canTransition('NOT_A_REAL_STATUS', 'OPEN')).toBe(false);
    });
});

describe('assertTransition', () => {
    test('does not throw for a valid transition', () => {
        expect(() => assertTransition('DRAFT', 'OPEN')).not.toThrow();
    });

    test('throws a ConflictError with a specific message when the status is unchanged', () => {
        expect(() => assertTransition('PAID', 'PAID')).toThrow('Pre-order is already paid');
    });

    test('throws a ConflictError with a specific message for an invalid transition', () => {
        expect(() => assertTransition('DRAFT', 'COMPLETED')).toThrow(
            'Cannot move a pre-order from DRAFT to COMPLETED'
        );
    });

    test('the thrown error is a ConflictError (name + statusCode)', () => {
        try {
            assertTransition('CANCELLED', 'OPEN');
            throw new Error('expected assertTransition to throw');
        } catch (err) {
            expect(err.name).toBe('ConflictError');
            expect(err.statusCode).toBe(409);
        }
    });
});
