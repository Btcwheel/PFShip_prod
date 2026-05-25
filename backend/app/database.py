from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.config import MYSQL_URL, SQLITE_URL

# MySQL (sincrono, read-only sul DB cliente)
mysql_engine = create_engine(MYSQL_URL, pool_pre_ping=True)
MysqlSession = sessionmaker(bind=mysql_engine, autocommit=False, autoflush=False)

# SQLite (asincrono, dati nuovi)
sqlite_engine = create_async_engine(SQLITE_URL, echo=False)
SqliteSession = sessionmaker(bind=sqlite_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


def get_mysql():
    db = MysqlSession()
    try:
        yield db
    finally:
        db.close()


async def get_sqlite():
    async with SqliteSession() as session:
        yield session


async def init_sqlite():
    async with sqlite_engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titolo TEXT NOT NULL,
                descrizione TEXT,
                utente TEXT,
                priorita TEXT DEFAULT 'normale',
                stato TEXT DEFAULT 'aperto',
                creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
