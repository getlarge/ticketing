ARG NODE_VERSION=16.7

FROM node:${NODE_VERSION}-alpine

ARG APP_NAME=client
ENV NX_CLOUD_NO_TIMEOUTS=true

WORKDIR /app

COPY ./apps/${APP_NAME}/package*.json .
RUN npm ci --production --loglevel=error

# important to copy after installation for efficient deps caching
COPY ./dist/apps/${APP_NAME} ./

CMD ["node_modules/.bin/next", "start"]
