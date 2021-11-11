ARG NODE_VERSION=16.7

FROM node:${NODE_VERSION}-alpine

ARG APP_NAME=auth

WORKDIR /app

ENV NX_CLOUD_NO_TIMEOUTS=true

COPY ./apps/${APP_NAME}/package*.json ./
RUN npm ci --production --loglevel=error
RUN npm install tslib
# important to copy after installation for efficient deps caching
COPY ./dist/apps/${APP_NAME} ./
CMD ["node", "./main.js"]