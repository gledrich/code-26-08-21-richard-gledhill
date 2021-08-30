FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN NODE_ENV=$NODE_ENV npm install

COPY . .

EXPOSE $PORT

CMD [ "node", "src/index.js" ]