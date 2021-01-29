FROM node:current

WORKDIR /app

RUN npm install pm2 -g 

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn run build-prod

CMD [ "pm2-runtime", "start", "pm2.json" ]