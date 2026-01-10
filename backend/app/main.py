from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Job Lens API", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Job Lens API is running"}
