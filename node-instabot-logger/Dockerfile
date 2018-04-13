FROM node:latest

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --production

COPY src src
COPY Makefile Makefile

ENV DB_HOST= \
DB_NAME=

CMD ["make", "run"]
