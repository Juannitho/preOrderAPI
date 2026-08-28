# Use the official Node.js image as a base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY src ./src

# Expose ports
EXPOSE 3009 5555

# Start the application
CMD ["npm", "start"]