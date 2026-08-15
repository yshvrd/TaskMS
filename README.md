# 🚀 TaskMS - Full-Stack Task & User Management SaaS

A modern, production-ready Task Management application featuring role-based access control (RBAC), multi-tier user hierarchies, dual-view dashboards (List & Kanban), secure external API proxying, and a complete Tailwind v4 Dark Mode architecture.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS v4
* **State & Drag-and-Drop:** `@hello-pangea/dnd` (React 18 compatible Kanban engine)
* **Icons & UI:** Lucide React, date-fns

### **Backend**
* **Framework:** FastAPI (Python)
* **Database & ORM:** PostgreSQL with SQLAlchemy
* **Authentication:** JWT (JSON Web Tokens), `pwdlib` with Argon2 password hashing
* **Validation:** Pydantic v2

---

## ✨ Core Features & Bonus Architecture

* **Multi-Tier Role-Based Access Control (RBAC):**
  * `Member`: Can view, create, comment on, and manage their assigned tasks.
  * `Admin`: Can view all users, onboard new team members, and manage standard task flows.
  * `Superadmin`: Ultimate control tier. Protected from modification or deletion by lower-level admins.
* **Dual-Mode Task Workspaces:** Seamlessly toggle between a traditional **List/Table view** (with search, pagination, and multi-parameter filters) and a  **Kanban Board view** featuring live optimistic drag-and-drop mechanics.
* **Secure External API Proxy:** Backend securely proxies external API requests, hiding secret keys from the client-side.
* **Full Dark Mode Support:** Built natively with Tailwind CSS v4 utility classes and state persistence.

---

## 🏁 Getting Started (Docker Installation)

The absolute fastest and cleanest way to run TaskMS is using Docker Compose. It spins up both the FastAPI backend and React frontend concurrently.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

### Quick Start
1. **Clone the repository**
   ```bash
   git clone [https://github.com/yshvrd/TaskMS.git](https://github.com/yshvrd/TaskMS.git)
   cd TaskMS
   ```

2. **Create a .env file at backend/**
```bash
# .env 
DATABASE_URL=postgresql://taskflow:taskflow@db:5432/taskflow
AUTH_SECRET_KEY=change-this-later
```

3. **Launch the application**
```bash
docker compose up --build
```

4. **Initialize DB and populate with seed data**
```bash
docker compose exec backend alembic upgrade head

docker compose exec backend python seed-data.py
```

5. **Access the app**
```bash
Frontend UI: http://localhost:5173

API Docs (Swagger): http://localhost:8000/docs
```

6. **Stop the app**
```bash
docker compose down
```

---

## 🔑 Default Credentials & Testing

To test role-based privileges immediately, use the pre-configured accounts:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `superadmin@tsms.com` | `super@tsms123` | Full control over all users, roles, and tasks. Can assign other superadmins |
| **Admin** | `admin@taskms.com` | `admin@tsms123` | Can manage regular members and view team tasks |
| **Member** | `member@taskms.com` | `member@tsms123` | Standard task management and collaboration |

---

## Project Structure 

```bash
taskms/
├── backend/
│   ├── models/        # SQLAlchemy database models
│   ├── routes/        # FastAPI endpoint routers (auth, tasks, users, proxy)
│   ├── schemas/       # Pydantic validation schemas
│   ├── utils/         # Auth, database, and logger utilities
│   └── main.py        # Application entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components & Modals
│   │   ├── pages/      # Views (Dashboard, TaskList, TaskDetail, Users)
│   │   ├── services/   # Axios API configurations
│   │   └── App.jsx     # Main React Router setup
└── docker-compose.yml  # Multi-container orchestration
```


---
