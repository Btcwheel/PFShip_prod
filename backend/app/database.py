from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from fastapi import HTTPException
from app.config import MYSQL_URL, SQLITE_URL

# MySQL (sincrono, read-only sul DB cliente) — lazy init
_mysql_engine = None
_MysqlSession = None

def _get_mysql_session():
    global _mysql_engine, _MysqlSession
    if _mysql_engine is None:
        _mysql_engine = create_engine(MYSQL_URL, pool_pre_ping=True)
        _MysqlSession = sessionmaker(bind=_mysql_engine, autocommit=False, autoflush=False)
    return _MysqlSession()

# SQLite (asincrono, dati nuovi)
sqlite_engine = create_async_engine(SQLITE_URL, echo=False)
SqliteSession = sessionmaker(bind=sqlite_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

def get_mysql():
    db = _get_mysql_session()
    try:
        yield db
    finally:
        db.close()

async def get_sqlite():
    async with SqliteSession() as session:
        yield session

async def get_pratica(pratica_id: int, db: AsyncSession) -> dict:
    result = await db.execute(text("SELECT * FROM pratiche WHERE id = :id"), {"id": pratica_id})
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Pratica {pratica_id} non trovata")
    return dict(row._mapping)

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

        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pratiche (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente TEXT, paese_origine TEXT, shipper TEXT,
                n_container INTEGER, tipo_container TEXT,
                peso_totale_kg REAL, peso_netto_kg REAL,
                descrizione_merce TEXT,
                porto_carico TEXT, porto_scarico TEXT,
                nave TEXT, nave_attuale TEXT,
                viaggio TEXT, compagnia_navigazione TEXT,
                bl_number TEXT, hbl_number TEXT,
                booking_number TEXT, invoice_number TEXT,
                container_number TEXT, seal_number TEXT,
                valore_merce_eur REAL,
                n_colli INTEGER, n_pezzi INTEGER,
                consignee TEXT, consignee_piva TEXT,
                eta_italia TEXT, etd_cina TEXT,
                gedoanag_id INTEGER,
                stato TEXT DEFAULT 'aperta',
                urgenza TEXT DEFAULT 'alta',
                step_corrente INTEGER DEFAULT 2,
                note TEXT, operatore TEXT,
                allegati_json TEXT,
                creata_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Migrazione colonne aggiunte dopo la prima versione (no-op se già esistono)
        for col, typedef in [
            ("nave_attuale", "TEXT"),
            ("gedoanag_id", "INTEGER"),
            ("hbl_number", "TEXT"),
            ("invoice_number", "TEXT"),
            ("container_number", "TEXT"),
            ("seal_number", "TEXT"),
            ("valore_merce_eur", "REAL"),
            ("peso_netto_kg", "REAL"),
            ("n_colli", "INTEGER"),
            ("n_pezzi", "INTEGER"),
            ("consignee", "TEXT"),
            ("consignee_piva", "TEXT"),
        ]:
            try:
                await conn.execute(text(f"ALTER TABLE pratiche ADD COLUMN {col} {typedef}"))
            except Exception:
                pass  # colonna già presente
