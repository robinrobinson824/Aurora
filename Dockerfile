# Use official Node 20 image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies separately to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy rest of the app
COPY app/ .

# Expose Next.js default port
EXPOSE 3000

# Run dev mode
CMD ["npm", "run", "dev"]