"""Import the SQL dump into Railway MySQL from local machine.
Usage: python scripts/import_mysql_local.py "C:\Users\Quixel\Downloads\Testmysql.sql"

This script reads Railway env vars (MYSQL_URL or MYSQL_HOST etc.) from .env
and imports the dump file directly."""

import pymysql
import sys
import os
import re

# Load .env
from dotenv import load_dotenv
load_dotenv()

# Parse Railway-style URL if available
_mysql_url = (
    os.environ.get("MYSQL_PRIVATE_URL")
    or os.environ.get("MYSQL_URL")
    or ""
)

if _mysql_url:
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
        print("Cannot parse MYSQL_URL")
        sys.exit(1)
else:
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.environ.get("MYSQL_PORT", "3306"))
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
    MYSQL_DB = os.environ.get("MYSQL_DB", "railway")

print(f"Target: {MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB} as {MYSQL_USER}")


def import_sql(filepath: str):
    print(f"Connecting to MySQL...")
    conn = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        connect_timeout=30,
        autocommit=False,
    )
    cursor = conn.cursor()
    print("Connected!")

    # Count existing tables
    cursor.execute(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s",
        (MYSQL_DB,),
    )
    tables_before = cursor.fetchone()[0]
    print(f"Tables before import: {tables_before}")

    buf = ""
    done = 0
    errors = 0
    file_size = os.path.getsize(filepath)
    bytes_read = 0

    print(f"Importing {filepath} ({file_size / 1024 / 1024:.1f} MB)...")

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            bytes_read += len(line.encode("utf-8"))
            s = line.strip()
            if not s or s.startswith("--") or s.startswith("/*"):
                continue
            if s[:6].upper() in ("LOCK T", "UNLOC"):
                continue
            buf += line
            if line.rstrip().endswith(";"):
                try:
                    cursor.execute(buf)
                    done += 1
                except Exception as e:
                    errors += 1
                    if "already exists" not in str(e) and "Duplicate" not in str(e):
                        print(f"  ERROR stmt {done}: {str(e)[:120]}")
                buf = ""
                if done % 500 == 0:
                    conn.commit()
                    pct = (bytes_read / file_size) * 100
                    print(f"  {done} statements ({pct:.0f}%) - {errors} errors")

    conn.commit()

    cursor.execute(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s",
        (MYSQL_DB,),
    )
    tables_after = cursor.fetchone()[0]

    # Count rows in key tables
    key_tables = ["gedoanag", "gefadcts", "cogeanag", "manifesti_master", "utenti"]
    print("\nRow counts for key tables:")
    for t in key_tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            count = cursor.fetchone()[0]
            print(f"  {t}: {count:,} rows")
        except:
            print(f"  {t}: NOT FOUND")

    print(f"\nDone! {done} statements executed. {errors} errors.")
    print(f"Tables: {tables_before} → {tables_after}")
    conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_mysql_local.py <path_to_sql_dump>")
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        sys.exit(1)

    import_sql(filepath)
