import { ConflictError } from '../utils/httpErrors.js';

export const TRANSITIONS = {
    DRAFT: ['OPEN', 'CANCELLED'],
    OPEN: ['PAID', 'CANCELLED'],
    PAID: ['ORDERED', 'CANCELLED'],
    ORDERED: ['DELIVERED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

export const MANAGER_TRANSITIONS = ['ORDERED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export const EDITABLE_STATUSES = ['DRAFT', 'OPEN'];

export function canTransition(from, to) {
    return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from, to) {
    if (from === to) {
        throw new ConflictError(`Pre-order is already ${to.toLowerCase()}`);
    }
    if (!canTransition(from, to)) {
        throw new ConflictError(`Cannot move a pre-order from ${from} to ${to}`);
    }
}