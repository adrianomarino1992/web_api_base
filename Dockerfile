FROM node:latest as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run transpile

FROM node:latest

WORKDIR /app

COPY package*.json .

RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 60000

CMD ["node", "dist/temp/Index.js", "--debug"]