from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_sqlite
from app.auth import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


class TicketIn(BaseModel):
    titolo: str
    descrizione: Optional[str] = None
    priorita: Optional[str] = "normale"


@router.get("")
async def lista_tickets(
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user)
):
    result = await db.execute(text(
        "SELECT * FROM tickets ORDER BY creato_il DESC"
    ))
    rows = result.fetchall()
    return [dict(r._mapping) for r in rows]


@router.post("", status_code=201)
async def crea_ticket(
    ticket: TicketIn,
    db: AsyncSession = Depends(get_sqlite),
    user=Depends(get_current_user)
):
    await db.execute(text("""
        INSERT INTO tickets (titolo, descrizione, utente, priorita)
        VALUES (:titolo, :descrizione, :utente, :priorita)
    """), {
        "titolo": ticket.titolo,
        "descrizione": ticket.descrizione,
        "utente": user["sub"],
        "priorita": ticket.priorita,
    })
    await db.commit()
    return {"ok": True}


@router.patch("/{ticket_id}/chiudi")
async def chiudi_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_sqlite),
    _user=Depends(get_current_user)
):
    result = await db.execute(text(
        "UPDATE tickets SET stato = 'chiuso' WHERE id = :id"
    ), {"id": ticket_id})
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Ticket non trovato")
    return {"ok": True}
