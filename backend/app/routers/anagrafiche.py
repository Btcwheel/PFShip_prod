from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_mysql
from app.auth import get_current_user

router = APIRouter(prefix="/api/anagrafiche", tags=["anagrafiche"])


@router.get("")
def lista_anagrafiche(
    search: str = Query(default="", description="Cerca per ragione sociale"),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_mysql),
    _user=Depends(get_current_user)
):
    like = f"%{search}%"
    rows = db.execute(text("""
        SELECT id, ragi_socia, indirizzo, localita, provincia,
               part_iva, codi_fisca, email, nume_telef, tipo
        FROM gedoanag
        WHERE (cancellato IS NULL OR cancellato = 0)
          AND (ragi_socia LIKE :s OR part_iva LIKE :s OR codi_fisca LIKE :s)
        ORDER BY ragi_socia
        LIMIT :limit OFFSET :offset
    """), {"s": like, "limit": limit, "offset": offset}).fetchall()

    total = db.execute(text("""
        SELECT COUNT(*) FROM gedoanag
        WHERE (cancellato IS NULL OR cancellato = 0)
          AND (ragi_socia LIKE :s OR part_iva LIKE :s OR codi_fisca LIKE :s)
    """), {"s": like}).scalar()

    return {"total": total, "items": [dict(r._mapping) for r in rows]}
