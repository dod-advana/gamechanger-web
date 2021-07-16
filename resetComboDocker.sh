#!/usr/bin/env bash

VOLUMES=0
COMPOSE_FILES_ARGS="-f docker-compose.combo.yml"
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --volumes)
      VOLUMES=1
      shift # past argument
      ;;
    --matomo)
      COMPOSE_FILES_ARGS="$COMPOSE_FILES_ARGS -f docker-compose.matomo.yml"
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
docker-compose $COMPOSE_FILES_ARGS build --no-cache
docker-compose $COMPOSE_FILES_ARGS up
