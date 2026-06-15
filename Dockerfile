FROM node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npx prisma generate
RUN npm run build


FROM node:24-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder  /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder  /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
USER node
CMD ["node", "dist/main"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok ? 0 : 1)).catch(()=>process.exit(1))"

