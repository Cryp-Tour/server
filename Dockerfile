FROM node:16-alpine
COPY package*.json ./
RUN npm install
COPY . .
ENV IN_DOCKER=1
EXPOSE 3030
CMD [ "node", "server.js" ]
