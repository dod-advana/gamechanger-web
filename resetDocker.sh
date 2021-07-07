#!/usr/bin/env bash

VOLUMES=0
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --volumes)
      VOLUMES=1
      shift # past argument
      ;;
    *)    # unknown option
      shift # past argument
      ;;
  esac
done

docker-compose down
docker system prune -f
if (($VOLUMES)); then
  docker system prune --volumes -f
fi
docker-compose build
docker-compose up
