# syntax=docker/dockerfile:1

# build on alpine linux with node's latest stable verion
FROM node:lts-alpine

# get all arguments
ARG SERVER_PROTOCOL
ARG SERVER_URL
ARG SERVER_PORT

# change cwd
WORKDIR /vstamps_client

# install ffmpeg, node_modules and serve
RUN apk add --no-cache ffmpeg
COPY ./package*.json .
RUN npm install --quiet
RUN npm install -g serve

# copy code
COPY . .

# create production build
RUN REACT_APP_SERVER_PROTOCOL=${SERVER_PROTOCOL} \
  REACT_APP_SERVER_URL=${SERVER_URL} \
  REACT_APP_SERVER_PORT=${SERVER_PORT} \ 
  npm run build
