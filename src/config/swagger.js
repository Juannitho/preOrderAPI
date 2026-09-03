import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const definition = {
    openapi: '3.0.3',
    info: {
        title: 'Pre-Order System API',
        version: '1.0.0',
        description:
            'API for managing restaurant pre-orders: restaurants, staff logins, menus, bookings, ' +
            'the guest pre-order flow, and the food orders tied to each booking.',
    },
    servers: [
        { url: `http://localhost:${env.port}`, description: 'Local' },
    ],
    tags: [
        { name: 'Auth', description: 'Staff login and session info' },
        { name: 'Bookings', description: 'Restaurant bookings (staff)' },
        { name: 'Preorders', description: 'Pre-orders tied to a booking (staff)' },
        { name: 'Menu Categories', description: 'Menu category management (staff)' },
        { name: 'Menu Items', description: 'Menu item management (staff)' },
        { name: 'Guest', description: "The customer-facing pre-order flow, reached via a booking's access code — no login required" },
        { name: 'Webhooks', description: 'Inbound webhooks from third parties (Stripe)' },
        { name: 'System', description: 'Health and root endpoints' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description:
                    'JWT returned by POST /api/auth/login. Send as "Authorization: Bearer <token>".',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'Invalid credentials' },
                },
            },
            Booking: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    restaurantId: { type: 'string', format: 'uuid' },
                    createdById: { type: 'string', format: 'uuid' },
                    customerName: { type: 'string' },
                    customerEmail: { type: 'string', format: 'email', nullable: true },
                    customerPhone: { type: 'string', nullable: true },
                    bookingDatetime: { type: 'string', format: 'date-time' },
                    partySize: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Preorder: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    bookingId: { type: 'string', format: 'uuid' },
                    accessCode: { type: 'string' },
                    accessLink: { type: 'string', description: 'Only present on single-preorder responses' },
                    status: {
                        type: 'string',
                        enum: ['DRAFT', 'OPEN', 'PAID', 'ORDERED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
                    },
                    currency: { type: 'string', example: 'AUD' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            MenuCategory: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    restaurantId: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    sortOrder: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            MenuItem: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    categoryId: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    ingredients: { type: 'string', nullable: true },
                    priceCents: { type: 'integer' },
                    isAvailable: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            GuestOrderItem: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    menuItemId: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    unitPriceCents: { type: 'integer' },
                    quantity: { type: 'integer' },
                    lineTotalCents: { type: 'integer' },
                    notes: { type: 'string', nullable: true },
                },
            },
            GuestPreorderView: {
                type: 'object',
                description: "The guest-facing view of a preorder, reached via its access code",
                properties: {
                    customerName: { type: 'string' },
                    bookingDatetime: { type: 'string', format: 'date-time' },
                    partySize: { type: 'integer' },
                    status: {
                        type: 'string',
                        enum: ['DRAFT', 'OPEN', 'PAID', 'ORDERED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
                    },
                    currency: { type: 'string', example: 'AUD' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/GuestOrderItem' },
                    },
                    totalCents: { type: 'integer' },
                },
            },
        },
        responses: {
            Unauthorized: {
                description: 'Missing, malformed, expired, or invalid token',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                    },
                },
            },
            Forbidden: {
                description: 'Authenticated, but missing the required role',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                    },
                },
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                    },
                },
            },
            ValidationError: {
                description: 'Request body failed validation',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                    },
                },
            },
            Conflict: {
                description: 'The request conflicts with the resource\'s current state',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                    },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

export const swaggerSpec = swaggerJsdoc({
    definition,
    apis: ['./src/routes/*.js', './src/app.js'],
});
