from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints.candidates import router as candidates_router
from app.api.endpoints.interviews import router as interviews_router

app = FastAPI(title="PluriOne AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidates_router, prefix="/api/v1")
app.include_router(interviews_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Welcome to the PluriOne AI Interviews API"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "API and backend are running correctly",
    }