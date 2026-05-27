from dotenv import load_dotenv
import os
import re

load_dotenv()

# Railway automatically injects MYSQL_URL / MYSQL_PRIVATE_URL
# when a MySQL service is in the same project.
_mysql_url = (
    os.environ.get("MYSQL_PRIVATE_URL")
    or os.environ.get("MYSQL_URL")
    or ""
)

if _mysql_url:
    # Parse railway-style URL: mysql://user:pass@host:port/db
    match = re.match(
        r"mysql:\/\/(?P<user>[^:]+):(?P<pass>[^@]+)@(?P<host>[^:/]+):(?P<port>\d+)\/(?P<db>.+)",
        _mysql_url,
    )
    if match:
        MYSQL_HOST = match.group("host")
        MYSQL_PORT = int(match.group("port"))
        MYSQL_USER = match.group("user")
        MYSQL_PASSWORD = match.group("pass")
        MYSQL_DB = match.group("db")
    else:
        MYSQL_HOST = "mysql.railway.internal"
        MYSQL_PORT = 3306
        MYSQL_USER = "root"
        MYSQL_PASSWORD = ""
        MYSQL_DB = "railway"
else:
    # Fallback: individual env vars or defaults
    MYSQL_HOST = (
        os.environ.get("MYSQL_HOST")
        or os.environ.get("MYSQLHOST")
        or "mysql.railway.internal"
    )
    MYSQL_PORT = int(
        os.environ.get("MYSQL_PORT") or os.environ.get("MYSQLPORT") or "3306"
    )
    MYSQL_USER = (
        os.environ.get("MYSQL_USER") or os.environ.get("MYSQLUSER") or "root"
    )
    MYSQL_PASSWORD = (
        os.environ.get("MYSQL_PASSWORD") or os.environ.get("MYSQLPASSWORD") or ""
    )
    MYSQL_DB = (
        os.environ.get("MYSQL_DB")
        or os.environ.get("MYSQLDATABASE")
        or os.environ.get("MYSQL_DATABASE")
        or "railway"
    )

SQLITE_PATH = os.getenv("SQLITE_PATH", "./pfship_local.db")

AIS_BASE_URL = os.getenv("AIS_BASE_URL", "http://localhost:5001")

JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 480))

MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
SQLITE_URL = f"sqlite+aiosqlite:///{SQLITE_PATH}"

# ─── Email (IMAP/SMTP) ──────────────────────────────────────────────────────
EMAIL_IMAP_HOST = os.getenv("EMAIL_IMAP_HOST", "imap.gmail.com")
EMAIL_IMAP_PORT = int(os.getenv("EMAIL_IMAP_PORT", "993"))
EMAIL_IMAP_USER = os.getenv("EMAIL_IMAP_USER", "")
EMAIL_IMAP_PASSWORD = os.getenv("EMAIL_IMAP_PASSWORD", "")

EMAIL_SMTP_HOST = os.getenv("EMAIL_SMTP_HOST", "smtp.gmail.com")
EMAIL_SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "587"))
EMAIL_SMTP_USER = os.getenv("EMAIL_SMTP_USER", EMAIL_IMAP_USER)
EMAIL_SMTP_PASSWORD = os.getenv("EMAIL_SMTP_PASSWORD", EMAIL_IMAP_PASSWORD)

EMAIL_POLL_INTERVAL = int(os.getenv("EMAIL_POLL_INTERVAL_SECONDS", "60"))
EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", EMAIL_IMAP_USER)
