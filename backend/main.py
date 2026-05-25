from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_sqlite
from app.routers import auth, anagrafiche, manifesti, dashboard, tickets, fatture, agenti


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_sqlite()
    yield


app = FastAPI(title="Gestione PFship", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5250"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(anagrafiche.router)
app.include_router(manifesti.router)
app.include_router(dashboard.router)
app.include_router(tickets.router)
app.include_router(fatture.router)
app.include_router(agenti.router)


@app.get("/")
def root():
    return {"status": "ok", "app": "Gestione PFship"}
