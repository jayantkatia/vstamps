# syntax=docker/dockerfile:1

ARG CLIENT_PORT
ARG SERVER_PORT

FROM node:lts-alpine
WORKDIR /vstamps_client
ENV REACT_APP_SERVER_URL=127.0.0.1
ENV REACT_APP_SERVER_PORT=$SERVER_PORT
ENV REACT_APP_SERVER_PROTOCOL=http

RUN apk add --no-cache ffmpeg
COPY ./package*.json .
RUN npm install --quiet
RUN npm install -g serve
EXPOSE $CLIENT_PORT
EXPOSE $SERVER_PORT
COPY . .
RUN npm build
