FROM node:alpine

WORKDIR /app

ENV NX_CLOUD_NO_TIMEOUTS=true

COPY ./apps/auth/package*.json .
RUN npm ci --production --loglevel=error
RUN npm install tslib
# important to copy after installation for efficient deps caching
COPY ./dist/apps/auth .
CMD ["node", "./main.js"]