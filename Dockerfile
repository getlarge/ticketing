## see 
## https://medium.com/swlh/nx-nestjs-react-docker-deploys-928a55fc19fd
## https://andrewlock.net/caching-docker-layers-on-serverless-build-hosts-with-multi-stage-builds---target,-and---cache-from/
ARG NODE_VERSION=16.7

FROM node:${NODE_VERSION}-alpine AS deps

ARG NODE_ENV
ARG BUILD_FLAGWORKDIR /app/builder

WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

# RUN apk add --no-cache libc6-compat
# COPY ./ ./

COPY package*.json ./

RUN npm ci