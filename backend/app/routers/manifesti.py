from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_mysql
from app.auth import get_current_user

router = APIRouter(prefix="/api/manifesti", tags=["manifesti"])


@router.get("")
def lista_manifesti(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_mysql),
    _user=Depends(get_current_user)
):
    rows = db.execute(text("""
        SELECT id, data, utente, file_richiesta, FILE_ESITO, DATANULL
        FROM manifesti_master
        ORDER BY DATANULL DESC
        LIMIT :limit OFFSET :offset
    """), {"limit": limit, "offset": offset}).fetchall()

    total = db.execute(text("SELECT COUNT(*) FROM manifesti_master")).scalar()

    return {"total": total, "items": [dict(r._mapping) for r in rows]}
