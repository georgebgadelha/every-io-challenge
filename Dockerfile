FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY src ./src

COPY tsconfig.json .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:deploy && npm start"]
