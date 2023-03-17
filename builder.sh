#!/usr/bin/env bash

set -x
set -e

NAME=ware_build
DEST=${1:-build}

docker image build -t $NAME .
docker container run -d --name $NAME $NAME
docker container cp $NAME:/app/build $DEST
docker container rm -f $NAME
# docker image rm $NAME

echo "The code is built and placed in the '$DEST' folder for deployment"
