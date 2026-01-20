FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js ./
COPY domainStore.js ./
COPY domain_store.json ./

EXPOSE 3000
CMD ["node", "server.js"]