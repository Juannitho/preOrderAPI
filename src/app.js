import express from "express";
import cors from 'cors';
import errorHandler from "./middlewares/errorHandler.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from './routes/auth.routes.js';
import menuCategoryRoutes from './routes/menuCategory.routes.js';
import menuItemRoutes from './routes/menuItem.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import preorderRoutes from './routes/preorder.routes.js';
import hostRoutes from './routes/host.routes.js';
import { connectDB } from "./config/db.js";
import { env } from './config/env.js';

const app = express();
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Pre-Order System API is running" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", menuCategoryRoutes);
app.use('/api/menu/items', menuItemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/p', hostRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
