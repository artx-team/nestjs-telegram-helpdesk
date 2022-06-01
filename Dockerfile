FROM node:16-alpine3.11

ENV APP_DIR /bot

WORKDIR $APP_DIR

COPY . $APP_DIR

RUN npm i --only=prod && chmod +x ./start.sh

CMD ./start.sh
