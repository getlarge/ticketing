FROM node:alpine

WORKDIR /app

ENV NX_CLOUD_NO_TIMEOUTS=true
ENV PORT=3333
EXPOSE ${PORT}

COPY ./dist/apps/auth/package.json .
RUN npm install --production
RUN npm install reflect-metadata tslib rxjs @nestjs/platform-express

# important to copy after installation for caching
COPY ./dist/apps/auth .

CMD ["node", "./main.js"]
