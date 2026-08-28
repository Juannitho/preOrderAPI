import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid credentials');
        this.name = 'InvalidCredentialsError';
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