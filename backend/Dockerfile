FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DIRECT_URL="postgresql://dummy:password@localhost:5432/dummy"
ENV DATABASE_URL="postgresql://dummy:password@localhost:5432/dummy"

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]