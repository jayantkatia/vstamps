# VStamps
Search video for timestamps

## Deployment Steps
1. Create a VM on azure/aws/others
2. Create inbound rules for HTTP(80) and HTTPS(443)
3. Create a static public DNS label
4. SSH into VM
5. Clone the repo and change directory to the repo
    > [if repo private] Enter username and personal access token
6. Change ```SERVER_URL``` to your public IP/DNS in ```.env``` and ```./nginx/default```. Run
    ```sh
    vi .env

    vi ./nginx/default 


    # press i for insert-mode
    # :wq to save and exit
    ```
7. Run
    ```sh
    source script.sh
    vstamps_init

    ```
8. Run Docker containers
    ```sh
    docker-compose up -d
    ```
9. Test and change configurations in ```/etc/nginx/sites-enabled/default``` and ```/etc/nginx/nginx.conf```  if needed. For example, 
```
# nginx.conf

http {

    # add to increase req body
    client_max_body_size 500M;
    
    # add to increase connection timeout
    proxy_connect_timeout       600;
    proxy_send_timeout          600;
    proxy_read_timeout          600;
    send_timeout                600;
}

```
11. 🚀 Deployed!

## Client
1. Change directory to client, ```cd client``` 
2. Install dependencies, ```yarn i```
>Note: Deploying to site does not commit source code to remote

## Server
1. Change directory to client, ```cd server/fask_service``` 
2. Install dependencies, ```pip install -r requirements.txt```
3. To run, ```flask run```
