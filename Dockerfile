# Use the official Node.js image as a base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy Prisma schema/config so `npm ci` can generate the client (postinstall)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies (also runs `prisma generate` via postinstall)
RUN npm ci

# Copy application source
COPY src ./src

# Expose ports (API + Prisma Studio)
EXPOSE 3000 5555

# Start the application
CMD ["npm", "run", "dev"]