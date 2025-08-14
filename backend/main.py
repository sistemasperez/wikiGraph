from fastapi import FastAPI, Depends
from routers.wikipedia import router as wikipedia_router
from routers.explorations import router as explorations_router
from dotenv import load_dotenv
from app_lifespan import startup_db_client, shutdown_db_client # Import from app_lifespan.py

# Load environment variables from .env file
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",  # Allow requests from your React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _startup_event(): # Renamed to avoid conflict with imported function
    await startup_db_client()

@app.on_event("shutdown")
async def _shutdown_event(): # Renamed to avoid conflict with imported function
    await shutdown_db_client()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(wikipedia_router)
app.include_router(explorations_router)