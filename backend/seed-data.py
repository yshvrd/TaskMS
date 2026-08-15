from datetime import datetime, timedelta, timezone
from models.db_models import User, Task
from utils.db_utils import SessionLocal
from services.auth_service import hash_password

print("🌱 Starting database seeding process...")

db = SessionLocal()

try:
    # 1. Clear existing seed data to prevent duplicate key errors (Optional safety step)
    print("🧹 Cleaning up existing records...")
    db.query(Task).delete()
    db.query(User).delete()
    db.commit()

    # 2. Create Seed Users based on exact specs
    print("👤 Creating users (Superadmin, Admin, Member 1, Member 2)...")
    
    superadmin = User(
        name="Super Admin",
        email="superadmin@taskms.com",
        role="superadmin",
        hashed_password=hash_password("super@tsms123"),
    )
    
    admin = User(
        name="System Admin",
        email="admin@taskms.com",
        role="admin",
        hashed_password=hash_password("admin@tsms123"),
    )
    
    member1 = User(
        name="Alice Johnson",
        email="member1@taskms.com",
        role="member",
        hashed_password=hash_password("member1@tsms123"),
    )

    member2 = User(
        name="Bob Williams",
        email="member2@taskms.com",
        role="member",
        hashed_password=hash_password("member2@tsms123"),
    )

    db.add_all([superadmin, admin, member1, member2])
    db.flush() # Flush to generate user IDs for task assignments
    print("✅ Users created successfully.")

    now = datetime.now(timezone.utc)

    # 3. Create 20 Realistic Tasks for Member 1 (Alice)
    print("📋 Generating 20 realistic tasks for Member 1 (Alice)...")
    member1_tasks = [
        Task(title="Refactor user authentication middleware", description="Migrate custom token checks to latest security standards.", status="completed", priority="high", assigned_to=member1.id, due_date=now - timedelta(days=4)),
        Task(title="Optimize PostgreSQL query indexes", description="Analyze slow-running queries on the tasks table.", status="in_progress", priority="urgent", assigned_to=member1.id, due_date=now + timedelta(days=1)),
        Task(title="Implement Redis caching layer", description="Cache dashboard analytics endpoints to improve response time.", status="pending", priority="medium", assigned_to=member1.id, due_date=now + timedelta(days=6)),
        Task(title="Write unit tests for user management routes", description="Achieve at least 85% test coverage for admin user CRUD operations.", status="pending", priority="high", assigned_to=member1.id, due_date=now + timedelta(days=3)),
        Task(title="Fix CORS policy mismatch in production", description="Ensure secure cross-origin requests from frontend client domain.", status="completed", priority="urgent", assigned_to=member1.id, due_date=now - timedelta(days=10)),
        Task(title="Upgrade FastAPI to latest stable release", description="Check for breaking changes and patch dependencies.", status="blocked", priority="low", assigned_to=member1.id, due_date=now + timedelta(days=12)),
        Task(title="Configure automated GitHub Actions CI/CD", description="Set up automated testing and linting checks on pull requests.", status="completed", priority="medium", assigned_to=member1.id, due_date=now - timedelta(days=7)),
        Task(title="Design database migration rollback scripts", description="Ensure alembic revisions can safely downgrade without data loss.", status="in_progress", priority="high", assigned_to=member1.id, due_date=now + timedelta(days=2)),
        Task(title="Audit API rate limiting implementation", description="Prevent brute-force attacks on login endpoints.", status="pending", priority="urgent", assigned_to=member1.id, due_date=now + timedelta(days=4)),
        Task(title="Clean up deprecated python packages", description="Remove unused libraries from requirements.txt.", status="completed", priority="low", assigned_to=member1.id, due_date=now - timedelta(days=15)),
        Task(title="Implement structured JSON logging", description="Ensure logger formats all errors correctly for external log aggregators.", status="pending", priority="medium", assigned_to=member1.id, due_date=now + timedelta(days=8)),
        Task(title="Review security audit report", description="Patch vulnerability flags identified in dependency scans.", status="in_progress", priority="urgent", assigned_to=member1.id, due_date=now + timedelta(days=1)),
        Task(title="Draft API versioning strategy", description="Prepare documentation for upcoming /v2/ endpoints.", status="pending", priority="low", assigned_to=member1.id, due_date=now + timedelta(days=14)),
        Task(title="Fix memory leak in background worker", description="Investigate unbounded queue growth during heavy sync tasks.", status="completed", priority="high", assigned_to=member1.id, due_date=now - timedelta(days=3)),
        Task(title="Setup environment secret management", description="Move hardcoded configuration flags to secure environment files.", status="completed", priority="medium", assigned_to=member1.id, due_date=now - timedelta(days=12)),
        Task(title="Test WebSocket connection persistence", description="Ensure real-time notification sockets handle reconnections gracefully.", status="blocked", priority="medium", assigned_to=member1.id, due_date=now + timedelta(days=9)),
        Task(title="Refactor error handling middleware", description="Standardize JSON error response structures across all routes.", status="pending", priority="high", assigned_to=member1.id, due_date=now + timedelta(days=5)),
        Task(title="Perform database backup verification", description="Restore staging dump from automated backup snapshot.", status="completed", priority="low", assigned_to=member1.id, due_date=now - timedelta(days=20)),
        Task(title="Optimize Docker multi-stage build image size", description="Strip unnecessary build tools from production container runner.", status="in_progress", priority="medium", assigned_to=member1.id, due_date=now + timedelta(days=3)),
        Task(title="Write developer onboarding documentation", description="Document local environment setup via Docker Compose.", status="completed", priority="low", assigned_to=member1.id, due_date=now - timedelta(days=2))
    ]

    # 4. Create 20 Realistic Tasks for Member 2 (Bob)
    print("📋 Generating 20 realistic tasks for Member 2 (Bob)...")
    member2_tasks = [
        Task(title="Design Kanban board UI wireframes", description="Map out user experience flow for drag-and-drop card movement.", status="completed", priority="high", assigned_to=member2.id, due_date=now - timedelta(days=6)),
        Task(title="Implement Tailwind CSS v4 dark mode toggle", description="Ensure state persistence and seamless color transition across components.", status="completed", priority="medium", assigned_to=member2.id, due_date=now - timedelta(days=4)),
        Task(title="Build responsive sidebar navigation layout", description="Ensure proper collapsing behavior on mobile viewport screens.", status="completed", priority="high", assigned_to=member2.id, due_date=now - timedelta(days=8)),
        Task(title="Integrate @hello-pangea/dnd for task boards", description="Add react 18 compatible drag-and-drop context wrappers.", status="completed", priority="urgent", assigned_to=member2.id, due_date=now - timedelta(days=3)),
        Task(title="Develop User Management Admin table", description="Create view for admins to update roles, change passwords, and delete accounts.", status="in_progress", priority="urgent", assigned_to=member2.id, due_date=now + timedelta(days=1)),
        Task(title="Fix z-index stacking context bug on modals", description="Ensure modal backdrop blur correctly covers background navigation elements.", status="completed", priority="low", assigned_to=member2.id, due_date=now - timedelta(days=1)),
        Task(title="Implement task search debounce logic", description="Prevent excessive API calls while typing search queries.", status="completed", priority="medium", assigned_to=member2.id, due_date=now - timedelta(days=5)),
        Task(title="Add loading skeleton states for data grids", description="Improve perceived performance during slow network fetch cycles.", status="completed", priority="low", assigned_to=member2.id, due_date=now - timedelta(days=11)),
        Task(title="Design custom empty state components", description="Create engaging graphic placeholders when task filter yields zero results.", status="pending", priority="low", assigned_to=member2.id, due_date=now + timedelta(days=7)),
        Task(title="Fix pagination state reset bug on filter change", description="Ensure page resets to 1 when users apply a status filter.", status="completed", priority="medium", assigned_to=member2.id, due_date=now - timedelta(days=2)),
        Task(title="Style form validation error message alerts", description="Make inline form feedback errors more prominent in red/rose tones.", status="pending", priority="high", assigned_to=member2.id, due_date=now + timedelta(days=3)),
        Task(title="Optimize React bundle size with code splitting", description="Analyze chunk distribution using Vite build analyzer plugins.", status="blocked", priority="medium", assigned_to=member2.id, due_date=now + timedelta(days=10)),
        Task(title="Write comprehensive frontend README instructions", description="Document setup steps, Docker execution, and default credentials clearly.", status="completed", priority="high", assigned_to=member2.id, due_date=now - timedelta(days=1)),
        Task(title="Implement toast notification system", description="Provide visual feedback alerts for successful task creation and deletion.", status="pending", priority="medium", assigned_to=member2.id, due_date=now + timedelta(days=4)),
        Task(title="Conduct cross-browser UI layout testing", description="Verify styling consistency across Chrome, Firefox, and Safari.", status="in_progress", priority="low", assigned_to=member2.id, due_date=now + timedelta(days=5)),
        Task(title="Refactor modal components into reusable wrappers", description="Extract shared backdrop and close button logic to cut code duplication.", status="completed", priority="medium", assigned_to=member2.id, due_date=now - timedelta(days=9)),
        Task(title="Add tooltips to action icon buttons", description="Improve accessibility and clarity for edit/delete table actions.", status="pending", priority="low", assigned_to=member2.id, due_date=now + timedelta(days=6)),
        Task(title="Test touch-screen drag responsiveness", description="Ensure Kanban card touch handling operates smoothly on tablets.", status="blocked", priority="high", assigned_to=member2.id, due_date=now + timedelta(days=8)),
        Task(title="Clean up unused CSS utility classes", description="Purge dead styling rules to optimize style sheet payload size.", status="pending", priority="low", assigned_to=member2.id, due_date=now + timedelta(days=12)),
        Task(title="Prepare final project delivery presentation demo", description="Record core features walkthrough covering roles and board views.", status="in_progress", priority="urgent", assigned_to=member2.id, due_date=now + timedelta(days=2))
    ]

    db.add_all(member1_tasks + member2_tasks)
    db.commit()
    
    print("✅ Successfully seeded 40 total tasks (20 for Member 1, 20 for Member 2).")
    print("🎉 Database seeding completed successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error during database seeding: {e}")
    raise e

finally:
    db.close()
    print("🔒 Database connection closed.")
