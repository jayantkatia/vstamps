#!/bin/bash

# Installation Script #
# Run on a fresh server to install docker and clone git repo

function init() {
  # install docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo apt-get install docker-compose
  sudo usermod -aG docker $USER
  newgrp docker

  # clone git repo
  git clone http://github.com/jayantkatia/vstamps
  cd vstamps

  # docker up instances
  docker-compose up -d
}
