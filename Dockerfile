FROM node:latest

WORKDIR /app

RUN apt-get -y update && apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn run build-prod

CMD [ "node", "build/index.js" ]
