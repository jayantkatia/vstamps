# syntax=docker/dockerfile:1

# build on alpine linux with node's latest stable verion
FROM node:lts-alpine

# get all arguments
ARG SERVER_PROTOCOL
ARG SERVER_URL
ARG CLIENT_PORT

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
  npm run build

# create express server
RUN CLIENT_PORT=${CLIENT_PORT}
WORKDIR /vstamps_client/express_server
RUN npm install --quiet

