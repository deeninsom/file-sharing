FROM node:lts-slim

WORKDIR /app

COPY package*.json ./

RUN npm install 

EXPOSE 8089

COPY . ./

CMD [ "npm", "run", "start" ]
