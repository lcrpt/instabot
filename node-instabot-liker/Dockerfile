FROM node:latest

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --production

COPY src src
COPY Makefile Makefile

ENV DB_HOST= \
DB_NAME= \
INSTABOT_SCRAPP_USER= \
INSTABOT_SCRAPP_PASS= \
LIKE_MAX_MINUTES= \
LIKE_MIN_MINUTES= \
DAILY_LIKE= \
LIKE_DELAY_MAX= \
LIKE_DELAY_MIN=

CMD ["make", "run"]
