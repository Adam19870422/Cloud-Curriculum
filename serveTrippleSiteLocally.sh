#!/bin/bash

temp_file=$(mktemp)
echo 'server {
    listen 8000;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
    }
}' > $temp_file

docker run -it --rm -p 8000:8000 --name web -v ./target:/usr/share/nginx/html -v $temp_file:/etc/nginx/conf.d/default.conf nginx

rm $temp_file