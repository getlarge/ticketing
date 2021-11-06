## see 
## https://medium.com/swlh/nx-nestjs-react-docker-deploys-928a55fc19fd
## https://andrewlock.net/caching-docker-layers-on-serverless-build-hosts-with-multi-stage-builds---target,-and---cache-from/
ARG NODE_VERSION=16.7

FROM node:${NODE_VERSION}-alpine AS builder

ARG NODE_ENV
ARG BUILD_FLAGWORKDIR /app/builder

COPY . .

RUN npm i