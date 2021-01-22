FROM node:latest

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn run build-prod

CMD [ "node", "build/index.js" ]
