import imaplib
import aiosmtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import policy
from email.header import decode_header
import re
import io
from typing import Optional
from app.config import (
    EMAIL_IMAP_HOST, EMAIL_IMAP_PORT, EMAIL_IMAP_USER, EMAIL_IMAP_PASSWORD,
    EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASSWORD,
    EMAIL_FROM_ADDRESS
)


def estrai_corpo_mail(msg: email.message.Message) -> str:
    """Estrae il corpo testuale da un messaggio email."""
    corpo = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                charset = part.get_content_charset() or "utf-8"
                try:
                    corpo = payload.decode(charset, errors="replace")
                    break
                except:
                    pass
            elif content_type == "text/html" and "attachment" not in content_disposition and not corpo:
                payload = part.get_payload(decode=True)
                charset = part.get_content_charset() or "utf-8"
                try:
                    html = payload.decode(charset, errors="replace")
                    corpo = re.sub(r'<[^>]+>', ' ', html)
                    corpo = re.sub(r'\s+', ' ', corpo).strip()
                except:
                    pass
    else:
        payload = msg.get_payload(decode=True)
        charset = msg.get_content_charset() or "utf-8"
        try:
            corpo = payload.decode(charset, errors="replace")
        except:
            corpo = ""
    return corpo


def estrai_allegati_mail(msg: email.message.Message) -> list[dict]:
    """Estrae gli allegati da un messaggio email."""
    allegati = []
    ESCLUDI_EXT = (".jpg", ".png", ".gif", ".jpeg", ".bmp", ".txt")
    
    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in content_disposition:
                filename = part.get_filename()
                if not filename:
                    continue
                payload = part.get_payload(decode=True)
                if payload:
                    nome_lower = filename.lower()
                    if any(nome_lower.endswith(ext) for ext in ESCLUDI_EXT):
                        allegati.append({"nome": filename, "testo": "(contenuto non estraibile)"})
                    else:
                        from app.routers.agenti import estrai_testo_allegato
                        testo = estrai_testo_allegato(filename, payload)
                        allegati.append({"nome": filename, "testo": testo if testo else "(contenuto non estraibile)"})
    return allegati


def check_new_emails_imap(seen_uids: set = None) -> list[dict]:
    """Controlla nuove email via IMAP e le restituisce come lista di dict."""
    if not EMAIL_IMAP_USER or not EMAIL_IMAP_PASSWORD:
        return []
    
    try:
        mail = imaplib.IMAP4_SSL(EMAIL_IMAP_HOST, EMAIL_IMAP_PORT)
        mail.login(EMAIL_IMAP_USER, EMAIL_IMAP_PASSWORD)
        mail.select("inbox")
        
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            mail.logout()
            return []
        
        email_list = []
        for num in messages[0].split():
            status, msg_data = mail.fetch(num, "(RFC822)")
            if status != "OK":
                continue
            
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email, policy=policy.default)
            
            # Decodifica header
            subject = ""
            if msg["Subject"]:
                decoded = decode_header(msg["Subject"])
                subject = " ".join([
                    t.decode(c) if isinstance(t, bytes) else t
                    for t, c in decoded
                ])
            
            from_addr = ""
            if msg["From"]:
                decoded = decode_header(msg["From"])
                from_addr = " ".join([
                    t.decode(c) if isinstance(t, bytes) else t
                    for t, c in decoded
                ])
            
            corpo = estrai_corpo_mail(msg)
            allegati = estrai_allegati_mail(msg)
            
            email_list.append({
                "uid": num.decode(),
                "mittente": from_addr,
                "destinatari": msg["To"] or "",
                "oggetto": subject,
                "data": msg["Date"] or "",
                "corpo": corpo[:6000],
                "allegati": allegati,
            })
        
        mail.logout()
        return email_list
    except Exception as e:
        print(f"Errore IMAP: {e}")
        return []


def mark_email_read_imap(uid: str):
    """Segna un'email come letta."""
    if not EMAIL_IMAP_USER or not EMAIL_IMAP_PASSWORD:
        return
    
    try:
        mail = imaplib.IMAP4_SSL(EMAIL_IMAP_HOST, EMAIL_IMAP_PORT)
        mail.login(EMAIL_IMAP_USER, EMAIL_IMAP_PASSWORD)
        mail.select("inbox")
        mail.store(uid, '+FLAGS', '\\Seen')
        mail.logout()
    except Exception as e:
        print(f"Errore nel segnare email come letta: {e}")


async def send_email_smtp(to: str, subject: str, body: str, html_body: str = None) -> bool:
    """Invia email via SMTP."""
    if not EMAIL_SMTP_USER or not EMAIL_SMTP_PASSWORD:
        print("SMTP non configurato")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_FROM_ADDRESS
        msg["To"] = to
        msg["Subject"] = subject
        
        msg.attach(MIMEText(body, "plain", "utf-8"))
        if html_body:
            msg.attach(MIMEText(html_body, "html", "utf-8"))
        
        async with aiosmtplib.SMTP(hostname=EMAIL_SMTP_HOST, port=EMAIL_SMTP_PORT, use_tls=False) as smtp:
            await smtp.starttls()
            await smtp.login(EMAIL_SMTP_USER, EMAIL_SMTP_PASSWORD)
            await smtp.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Errore SMTP: {e}")
        return False
