FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencias AS construcao
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# Estágio usado pelos testes e2e (docker compose --profile teste)
FROM dependencias AS teste
COPY . .
CMD ["npm", "run", "test:e2e"]

FROM node:24-alpine AS execucao
ENV NODE_ENV=production
WORKDIR /app
COPY --from=construcao /app/node_modules ./node_modules
COPY --from=construcao /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
# Migrações e carga inicial antes de aceitar requisições
CMD ["sh", "-c", "node dist/database/preparar.js && node dist/main.js"]
