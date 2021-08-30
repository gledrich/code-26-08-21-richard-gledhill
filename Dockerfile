FROM node:alpine

WORKDIR /app

COPY package*.json ./

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

RUN NODE_ENV=$NODE_ENV npm install

COPY . .

EXPOSE $PORT

CMD [ "node", "src/index.js" ]