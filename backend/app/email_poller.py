import asyncio
import json
from datetime import datetime
from app.email_service import check_new_emails_imap, mark_email_read_imap
from app.config import EMAIL_POLL_INTERVAL

# Stato globale del poller
_poller_running = False
_last_poll_time = None
_processed_uids = set()
_inbox_cache = []


async def email_poller_loop():
    """Loop principale del poller email."""
    global _poller_running, _last_poll_time, _inbox_cache
    
    _poller_running = True
    print(f"[EmailPoller] Avviato - polling ogni {EMAIL_POLL_INTERVAL}s")
    
    while _poller_running:
        try:
            new_emails = check_new_emails_imap()
            
            if new_emails:
                print(f"[EmailPoller] Trovate {len(new_emails)} nuove email")
                for email_data in new_emails:
                    # Salva nella cache inbox
                    email_data["processed_at"] = datetime.now().isoformat()
                    email_data["status"] = "received"
                    _inbox_cache.append(email_data)
                    
                    # Segna come letta
                    mark_email_read_imap(email_data["uid"])
                
                _last_poll_time = datetime.now().isoformat()
            
            await asyncio.sleep(EMAIL_POLL_INTERVAL)
            
        except Exception as e:
            print(f"[EmailPoller] Errore: {e}")
            await asyncio.sleep(30)  # Attendi prima di riprovare
    
    print("[EmailPoller] Fermato")


def start_poller():
    """Avvia il poller come task asyncio."""
    asyncio.create_task(email_poller_loop())


def get_inbox_status() -> dict:
    """Restituisce lo stato dell'inbox."""
    return {
        "running": _poller_running,
        "last_poll": _last_poll_time,
        "total_emails": len(_inbox_cache),
        "unprocessed": len([e for e in _inbox_cache if e.get("status") == "received"]),
    }


def get_inbox_emails() -> list[dict]:
    """Restituisce tutte le email ricevute."""
    return _inbox_cache


def get_email_by_uid(uid: str) -> dict | None:
    """Restituisce una email specifica per UID."""
    for email_data in _inbox_cache:
        if email_data["uid"] == uid:
            return email_data
    return None


def mark_email_processed(uid: str):
    """Segna un'email come processata."""
    for email_data in _inbox_cache:
        if email_data["uid"] == uid:
            email_data["status"] = "processed"
            email_data["processed_at"] = datetime.now().isoformat()
            break
