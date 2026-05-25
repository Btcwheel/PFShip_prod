from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_mysql
from app.auth import create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginJson(BaseModel):
    username: str
    password: Optional[str] = ""


def do_login(username: str, password: str, db: Session):
    row = db.execute(
        text("""
            SELECT nome, cognome, email FROM utenti
            WHERE nome = :u
              AND (password = :p OR password IS NULL OR password = '')
        """),
        {"u": username, "p": password or ""}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Credenziali errate")
    token = create_token({"sub": row.nome, "cognome": row.cognome or "", "email": row.email or ""})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_mysql)):
    return do_login(form.username, form.password, db)


@router.post("/login-json")
def login_json(body: LoginJson, db: Session = Depends(get_mysql)):
    return do_login(body.username, body.password, db)
