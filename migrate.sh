#!/bin/bash

MONGO_DIR="./data/mongo-data"

if [ ! -d "$MONGO_DIR" ]; then
    echo "Stopping running containers"
    docker-compose stop
    echo "Extracting databse from existing container"
    docker cp mongodb:/data/db "./data"
    mv "./data/db" $MONGO_DIR
    docker-compose rm -f
    docker-compose pull
    docker-compose up -d
    docker cp migrate.py core:/opt
    docker exec -ti core python /opt/migrate.py
else
    echo "$MONGO_DIR already exists"
    echo "Make sure it does not contain any data, delete it and run the script again"
fi

