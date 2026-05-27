from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.database import get_sqlite
from app.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    titolo: str
    descrizione: str = ""
    assegnato_a: str = ""
    priorita: str = "normale"
    categoria: str = "operativo"
    pratica_id: Optional[int] = None
    scadenza: Optional[str] = None


class TaskUpdate(BaseModel):
    titolo: Optional[str] = None
    descrizione: Optional[str] = None
    assegnato_a: Optional[str] = None
    priorita: Optional[str] = None
    stato: Optional[str] = None
    categoria: Optional[str] = None
    scadenza: Optional[str] = None


@router.get("")
async def list_tasks(
    stato: str = None,
    assegnato_a: str = None,
    priorita: str = None,
    db: AsyncSession = Depends(get_sqlite),
    _user=Depends(get_current_user),
):
    where = ["1=1"]
    params = {}
    if stato:
        where.append("stato = :stato")
        params["stato"] = stato
    if assegnato_a:
        where.append("assegnato_a = :assegnato_a")
        params["assegnato_a"] = assegnato_a
    if priorita:
        where.append("priorita = :priorita")
        params["priorita"] = priorita

    result = await db.execute(
        text(f"SELECT * FROM tasks WHERE {' AND '.join(where)} ORDER BY creato_il DESC"),
        params,
    )
    rows = result.fetchall()
    return [dict(r._mapping) for r in rows]


@router.get("/mie")
async def my_tasks(db: AsyncSession = Depends(get_sqlite), user=Depends(get_current_user)):
    username = user.get("sub", "")
    result = await db.execute(
        text("SELECT * FROM tasks WHERE assegnato_a = :u AND stato != 'completato' ORDER BY creato_il DESC"),
        {"u": username},
    )
    rows = result.fetchall()
    return [dict(r._mapping) for r in rows]


@router.post("")
async def create_task(
    body: TaskCreate,
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user),
):
    result = await db.execute(
        text("""
            INSERT INTO tasks (titolo, descrizione, assegnato_a, creato_da, priorita, categoria, pratica_id, scadenza)
            VALUES (:titolo, :descrizione, :assegnato_a, :creato_da, :priorita, :categoria, :pratica_id, :scadenza)
        """),
        {
            "titolo": body.titolo,
            "descrizione": body.descrizione,
            "assegnato_a": body.assegnato_a,
            "creato_da": user.get("sub", ""),
            "priorita": body.priorita,
            "categoria": body.categoria,
            "pratica_id": body.pratica_id,
            "scadenza": body.scadenza,
        },
    )
    await db.commit()
    return {"id": result.lastrowid, "status": "created"}


@router.patch("/{task_id}")
async def update_task(
    task_id: int,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user),
):
    check = await db.execute(text("SELECT id FROM tasks WHERE id = :id"), {"id": task_id})
    if not check.fetchone():
        raise HTTPException(status_code=404, detail="Task non trovato")

    updates = []
    params = {"id": task_id}
    for field in ["titolo", "descrizione", "assegnato_a", "priorita", "stato", "categoria", "scadenza"]:
        val = getattr(body, field, None)
        if val is not None:
            updates.append(f"{field} = :{field}")
            params[field] = val

    if body.stato == "completato":
        updates.append("completato_il = :completato_il")
        params["completato_il"] = datetime.utcnow().isoformat()

    if updates:
        await db.execute(
            text(f"UPDATE tasks SET {', '.join(updates)} WHERE id = :id"),
            params,
        )
        await db.commit()

    result = await db.execute(text("SELECT * FROM tasks WHERE id = :id"), {"id": task_id})
    return dict(result.fetchone()._mapping)


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_sqlite),
    _user=Depends(get_current_user),
):
    await db.execute(text("DELETE FROM tasks WHERE id = :id"), {"id": task_id})
    await db.commit()
    return {"status": "deleted"}