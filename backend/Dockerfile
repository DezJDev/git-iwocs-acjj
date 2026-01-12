FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size (optional)
# RUN npm prune --production

# Verify build output
RUN ls -la dist/

EXPOSE 3000

CMD ["npm", "start"]
