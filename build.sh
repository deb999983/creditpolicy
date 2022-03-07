set -o allexport
source api/.env
set +o allexport

docker build docker/django/. -t django
docker-compose up --build
