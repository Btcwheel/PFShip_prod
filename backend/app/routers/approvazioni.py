from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_sqlite
from app.auth import get_current_user

router = APIRouter(prefix="/api/approvazioni", tags=["approvazioni"])


@router.get("")
async def list_approvazioni(
    stato: str = None,
    db: AsyncSession = Depends(get_sqlite),
    _user=Depends(get_current_user),
):
    where = ["1=1"]
    params = {}
    if stato:
        where.append("a.stato = :stato")
        params["stato"] = stato

    result = await db.execute(
        text(f"""
            SELECT a.*, p.cliente as pratica_cliente, p.bl_number
            FROM approvazioni a
            LEFT JOIN pratiche p ON a.pratica_id = p.id
            WHERE {' AND '.join(where)}
            ORDER BY a.creato_il DESC
        """),
        params,
    )
    rows = result.fetchall()
    return [dict(r._mapping) for r in rows]


@router.get("/conteggio")
async def conteggio_pending(
    db: AsyncSession = Depends(get_sqlite),
    _user=Depends(get_current_user),
):
    result = await db.execute(
        text("SELECT COUNT(*) as n FROM approvazioni WHERE stato = 'pending'")
    )
    row = result.fetchone()
    return {"pending": row._mapping["n"] if row else 0}


class ApprovazioneAction(BaseModel):
    note: str = ""


@router.post("/{approvazione_id}/approva")
async def approva(
    approvazione_id: int,
    body: ApprovazioneAction,
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user),
):
    check = await db.execute(
        text("SELECT * FROM approvazioni WHERE id = :id"),
        {"id": approvazione_id},
    )
    row = check.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approvazione non trovata")
    approvazione = dict(row._mapping)

    if approvazione["stato"] != "pending":
        raise HTTPException(status_code=400, detail="Approvazione già processata")

    username = user.get("sub", "")
    now = datetime.utcnow().isoformat()

    await db.execute(
        text("""
            UPDATE approvazioni
            SET stato = 'approvato', revisore = :revisore, note_revisore = :note, revisionato_il = :ora
            WHERE id = :id
        """),
        {"id": approvazione_id, "revisore": username, "note": body.note, "ora": now},
    )

    nuovo_step = approvazione["step_numero"] + 1
    await db.execute(
        text("UPDATE pratiche SET step_corrente = :step WHERE id = :pid"),
        {"step": nuovo_step, "pid": approvazione["pratica_id"]},
    )

    await db.commit()
    return {"status": "approved", "nuovo_step": nuovo_step}


@router.post("/{approvazione_id}/respingi")
async def respingi(
    approvazione_id: int,
    body: ApprovazioneAction,
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user),
):
    check = await db.execute(
        text("SELECT * FROM approvazioni WHERE id = :id"),
        {"id": approvazione_id},
    )
    row = check.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approvazione non trovata")
    approvazione = dict(row._mapping)

    if approvazione["stato"] != "pending":
        raise HTTPException(status_code=400, detail="Approvazione già processata")

    username = user.get("sub", "")
    now = datetime.utcnow().isoformat()

    await db.execute(
        text("""
            UPDATE approvazioni
            SET stato = 'respinto', revisore = :revisore, note_revisore = :note, revisionato_il = :ora
            WHERE id = :id
        """),
        {"id": approvazione_id, "revisore": username, "note": body.note, "ora": now},
    )
    await db.commit()
    return {"status": "rejected"}