# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS development

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install --frozen-lockfile

# Copy app source
COPY . .

# Build the app
RUN pnpm run build

# Production image
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"] 