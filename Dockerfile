FROM node:20.11.1-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

COPY src/database/schema.prisma ./src/database/schema.prisma

RUN npx prisma generate --schema ./src/database/schema.prisma

RUN pnpm run build

RUN pnpm prune --prod

EXPOSE 3000

CMD ["pnpm", "start:migrate:prod"] 