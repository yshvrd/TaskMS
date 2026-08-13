# TaskMS

alembic 

docker compose exec backend alembic init alembic

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic upgrade head



frontend 
docker compose exec frontend npm install axios react-router-dom lucide-react

docker compose exec frontend npm install tailwindcss @tailwindcss/vite
