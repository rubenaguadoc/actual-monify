#!/bin/bash

set -e

CONTAINER=data-viewer
IMAGE=data-viewer:latest
NETWORK=app-net

git pull

docker network create $NETWORK 2>/dev/null || true

docker build -t $IMAGE .

docker rm -f $CONTAINER 2>/dev/null || true

docker run -d \
  --name $CONTAINER \
  --restart unless-stopped \
  --network $NETWORK \
  -p 127.0.0.1:3000:3000 \
  --env-file .env \
  $IMAGE
