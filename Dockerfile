FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE $PORT

CMD [ "node", "src/index.js" ]