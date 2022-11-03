# syntax=docker/dockerfile:1

# build on debian with python v3.10
FROM python:3.10-slim

# change cwd
WORKDIR /vstamps_server

# update and install ffmpeg
RUN apt-get update
RUN apt-get install -y ffmpeg
RUN pip install --upgrade pip

# install python packages
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy code
COPY . .
