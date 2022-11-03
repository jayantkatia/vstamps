# VStamps
Search video for timestamps

## Deployment Steps
1. Create a VM on azure/aws/others
2. Create 2 inbound rules for 80 & 5000
3. [optional] Create a static public DNS label
4. SSH into VM
5. Run
```
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo apt-get install docker-compose
  sudo usermod -aG docker $USER
  newgrp docker

  # clone git repo
  git clone http://github.com/jayantkatia/vstamps

```
6. [if repo private] Enter username and personal access token
7. Change directory to ```vstamps```
```
cd vstamps
```
8. Change ```SERVER_URL``` to your public IP/DNS in ```.env```. Run
```
vi .env

# press i for insert-mode
# :wq to save and exit
```
9. Run
```
  docker-compose up -d
```
10. 🚀 Deployed!

## Client
1. Change directory to client, ```cd client``` 
2. Install dependencies, ```yarn i```
>Note: Deploying to site does not commit source code to remote

## Server
1. Change directory to client, ```cd server/fask_service``` 
2. Install dependencies, ```pip install -r requirements.txt```
3. To run, ```flask run```
