docker-compose down
docker system prune -f
docker system prune --volumes -f
docker-compose build
docker-compose up
