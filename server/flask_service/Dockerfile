# syntax=docker/dockerfile:1

# build on debian with python v3.10
FROM python:3.10-slim

# change cwd
WORKDIR /vstamps_server

# update and install ffmpeg
RUN apt-get update
RUN apt-get install -y ffmpeg
RUN pip install --upgrade pip

# get and extract vosk-model
RUN apt-get install -y wget unzip
RUN wget https://alphacephei.com/vosk/models/vosk-model-en-us-0.21.zip
RUN unzip vosk-model-en-us-0.21.zip
RUN rm -rf vosk-model-en-us-0.21.zip

# install python packages
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy code
COPY . .
