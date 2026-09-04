import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { ConflictError } from '../utils/httpErrors.js';

const BCRYPT_ROUNDS = 12;

export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid credentials');
        this.name = 'InvalidCredentialsError';
    }
}

// Create a new staff/manager user in the given restaurant.
export async function register(restaurantId, { email, password, name, role }) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
        const user = await prisma.user.create({
            data: {
                restaurantId,
                email,
                passwordHash,
                name,
                role: role ?? 'STAFF',
            },
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch (err) {
        if (err.code === 'P2002') {
            throw new ConflictError('A user with that email already exists');
        }
        throw err;
    }
}

export async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        throw new InvalidCredentialsError();
    }

    const token = jwt.sign(
        { sub: user.id, role: user.role, restaurantId: user.restaurantId },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

export async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            restaurantId: true,
        },
    });
}