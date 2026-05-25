from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_mysql
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_mysql), _user=Depends(get_current_user)):
    # Ge.FA - Fatturazione
    totale_fatture = db.execute(text(
        "SELECT COUNT(*) FROM gefadcts WHERE cancellato = 0 OR cancellato IS NULL"
    )).scalar()

    fatture_anno = db.execute(text(
        "SELECT COUNT(*) FROM gefadcts WHERE anno_fattu = YEAR(NOW()) AND (cancellato = 0 OR cancellato IS NULL)"
    )).scalar()

    fatturato_anno = db.execute(text(
        "SELECT COALESCE(SUM(importo), 0) FROM gefadcts WHERE anno_fattu = YEAR(NOW()) AND (cancellato = 0 OR cancellato IS NULL) AND tipo_fattu NOT IN ('NC', 'ND')"
    )).scalar()

    # Ge.DO - Anagrafica operativa
    totale_anagrafiche = db.execute(text(
        "SELECT COUNT(*) FROM gedoanag WHERE cancellato = 0 OR cancellato IS NULL"
    )).scalar()

    # Ge.CO - Contabilità
    totale_coge = db.execute(text(
        "SELECT COUNT(*) FROM cogeanag WHERE cancellato = 0 OR cancellato IS NULL"
    )).scalar()

    # Ultime fatture
    ultime_fatture = db.execute(text("""
        SELECT anno_fattu, nume_docum, data_docum, desc_clien, importo, tipo_fattu
        FROM gefadcts
        WHERE cancellato = 0 OR cancellato IS NULL
        ORDER BY data_docum DESC, id DESC
        LIMIT 8
    """)).fetchall()

    # Ricavi per anno (ultimi 6 anni, escluse NC/ND)
    fatturato_per_anno = db.execute(text("""
        SELECT anno_fattu, COUNT(*) as num_fatture, COALESCE(SUM(importo), 0) as totale
        FROM gefadcts
        WHERE (cancellato = 0 OR cancellato IS NULL)
          AND tipo_fattu NOT IN ('NC', 'ND')
          AND anno_fattu >= YEAR(NOW()) - 5
        GROUP BY anno_fattu
        ORDER BY anno_fattu DESC
    """)).fetchall()

    # Ricavi totali per tipo
    ricavi_per_tipo = db.execute(text("""
        SELECT tipo_fattu, COUNT(*) as num, COALESCE(SUM(importo), 0) as totale
        FROM gefadcts
        WHERE (cancellato = 0 OR cancellato IS NULL)
        GROUP BY tipo_fattu
        ORDER BY num DESC
    """)).fetchall()

    return {
        "totale_fatture": totale_fatture,
        "fatture_anno": fatture_anno,
        "fatturato_anno": float(fatturato_anno or 0),
        "totale_anagrafiche": totale_anagrafiche,
        "totale_coge": totale_coge,
        "ultime_fatture": [dict(r._mapping) for r in ultime_fatture],
        "fatturato_per_anno": [dict(r._mapping) for r in fatturato_per_anno],
        "ricavi_per_tipo": [dict(r._mapping) for r in ricavi_per_tipo],
    }
