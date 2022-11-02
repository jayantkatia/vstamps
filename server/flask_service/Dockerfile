# syntax=docker/dockerfile:1

ARG SERVER_PORT

FROM python:3.10-slim
WORKDIR /vstamps_server
ENV SERVER_PORT=$SERVER_PORT

RUN apt-get update
RUN apt-get install -y ffmpeg
RUN pip install --upgrade pip

COPY ./requirements.txt .
RUN pip install -r requirements.txt
EXPOSE $SERVER_PORT
COPY . .
ENV FLASK_APP=app