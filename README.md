# TaskMS

alembic 

docker compose exec backend alembic init alembic

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic revision --autogenerate -m "initial schema"

docker compose exec backend alembic upgrade head



frontend 
docker compose exec frontend npm install axios react-router-dom lucide-react

docker compose exec frontend npm install tailwindcss @tailwindcss/vite


put seed data from seed.py file
docker compose exec backend python seed.py


check tasks endpoint 

/tasks?page=1&limit=20
/tasks?status=pending
/tasks?priority=high
/tasks?assignee=me
/tasks?assignee=2
/tasks?search=shopify
/tasks?sort_by=due_date&sort_order=asc


docker compose exec frontend npm install react-router-dom axios lucide-react date-fns clsx tailwind-merge
