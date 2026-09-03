import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from './routes/auth.routes.js';
import menuCategoryRoutes from './routes/menuCategory.routes.js';
import menuItemRoutes from './routes/menuItem.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import preorderRoutes from './routes/preorder.routes.js';
import hostRoutes from './routes/host.routes.js';
import { connectDB } from "./config/db.js";
import { env } from './config/env.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

// BEFORE express.json — signature verification needs the raw body
app.use('/webhooks', webhookRoutes);

app.use(express.json());
connectDB();

/**
 * @openapi
 * /:
 *   get:
 *     tags: [System]
 *     summary: API root
 *     security: []
 *     responses:
 *       200:
 *         description: The API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Pre-Order System API is running }
 */
app.get("/", (req, res) => {
  res.json({ message: "Pre-Order System API is running" });
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: The API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", menuCategoryRoutes);
app.use('/api/menu/items', menuItemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/p', hostRoutes);

// 404 for anything that matched no route
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler — must be registered last
app.use(errorHandler);

export default app;
