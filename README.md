# TaskMS

alembic 

docker compose exec backend alembic init alembic

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic upgrade head
