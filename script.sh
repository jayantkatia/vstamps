#!/bin/bash

# Installation Script #
# Run on a fresh server to install docker and nginx

function vstamps_init() {
  # upgrade
  sudo apt update && sudo apt upgrade -y

  # get env variables
  source .env

  # install docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo apt-get install -y docker-compose
  sudo usermod -aG docker $USER

  # installing nginx and ssl certificate
  sudo apt install -y nginx
  sudo apt install -y python3 python3-venv libaugeas0
  sudo python3 -m venv /opt/certbot/
  sudo /opt/certbot/bin/pip install --upgrade pip
  sudo /opt/certbot/bin/pip install certbot certbot-nginx
  sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
  sudo certbot --nginx -d $SERVER_URL -m bluestacksgamer34@gmail.com --agree-tos -n

  ## change configurations in /etc/nginx/sites-enabled
  sudo cp -f ./nginx/default /etc/nginx/sites-enabled/default
  sudo fuser -k 80/tcp
  sudo fuser -k 443/tcp
  sudo nginx -t
  sudo service nginx start
  
  # refreshing docker additions
  newgrp docker
}
