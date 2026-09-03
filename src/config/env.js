import dotenv from "dotenv";
dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  publicAppUrl: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  deeplApiKey: process.env.DEEPL_API_KEY,
  deeplApiUrl: process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  rabbitmqUrl: process.env.RABBITMQ_URL,
};