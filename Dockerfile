# Stage 1: Build the Expo web app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npx expo export --platform web

# Stage 2: Serve with serve
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

# Iniciar servidor
CMD ["serve", "-s", "dist", "-l", "3000"]
