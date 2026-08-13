from fastapi import FastAPI
from routes.auth import router as auth_router

app = FastAPI(title="TaskMS")


app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}
