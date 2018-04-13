FROM node:latest

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --production

COPY src src
COPY Makefile Makefile

ENV ENV DB_HOST= \
DB_NAME= \
INSTABOT_SCRAPP_USER= \
INSTABOT_SCRAPP_PASS=

CMD ["make", "run"]
