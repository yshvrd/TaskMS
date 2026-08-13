from fastapi import FastAPI

app = FastAPI(title="TaskMS")


@app.get("/health")
def health():
    return {"status": "ok"}
