from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_mysql
from app.auth import get_current_user

router = APIRouter(prefix="/api/fatture", tags=["fatture"])


@router.get("")
def lista_fatture(
    search: str = Query(default=""),
    anno: int = Query(default=0),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_mysql),
    _user=Depends(get_current_user)
):
    like = f"%{search}%"
    anno_filter = "AND anno_fattu = :anno" if anno else ""

    rows = db.execute(text(f"""
        SELECT id, anno_fattu, nume_docum, data_docum, desc_clien,
               tipo_fattu, importo, impo_impon, impo_iva, codi_causa
        FROM gefadcts
        WHERE (cancellato = 0 OR cancellato IS NULL)
          AND (desc_clien LIKE :s OR CAST(nume_docum AS CHAR) LIKE :s)
          {anno_filter}
        ORDER BY data_docum DESC, id DESC
        LIMIT :limit OFFSET :offset
    """), {"s": like, "anno": anno or 0, "limit": limit, "offset": offset}).fetchall()

    total = db.execute(text(f"""
        SELECT COUNT(*) FROM gefadcts
        WHERE (cancellato = 0 OR cancellato IS NULL)
          AND (desc_clien LIKE :s OR CAST(nume_docum AS CHAR) LIKE :s)
          {anno_filter}
    """), {"s": like, "anno": anno or 0}).scalar()

    return {"total": total, "items": [dict(r._mapping) for r in rows]}
