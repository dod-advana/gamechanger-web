docker-compose down
docker system prune -f
docker system prune --volumes -f
docker-compose -f docker-compose.combo.yml build --no-cache
docker-compose -f docker-compose.combo.yml up
