"""Import the SQL dump into MySQL from within Railway's internal network.
Run inside the backend container: python scripts/import_mysql.py"""

import pymysql
import sys
import urllib.request

MYSQL_HOST = "mysql.railway.internal"
MYSQL_PORT = 3306
MYSQL_USER = "root"
MYSQL_PASSWORD = "eXlRHmUjyqKPSqkITqZkFaRsARjkPHXt"
MYSQL_DB = "railway"

DUMP_URL = None  # Set this to a publicly accessible URL of the dump


def download_dump(url: str) -> str:
    print(f"Downloading dump from {url}...")
    urllib.request.urlretrieve(url, "/tmp/dump.sql")
    print("Download complete.")
    return "/tmp/dump.sql"


def import_sql(filepath: str):
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
    print("Connected to MySQL via internal network.")

    buf = ""
    done = 0
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
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
                    if "already exists" not in str(e) and "Duplicate" not in str(e):
                        print(f"  ERROR stmt {done}: {str(e)[:80]}")
                buf = ""
                if done % 200 == 0:
                    conn.commit()
                    print(f"  {done} statements")

    conn.commit()
    cursor.execute(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s",
        (MYSQL_DB,),
    )
    tables = cursor.fetchone()[0]
    print(f"\nDone! {done} statements executed. Tables: {tables}")
    conn.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    elif DUMP_URL:
        filepath = download_dump(DUMP_URL)
    else:
        filepath = "/app/dump.sql"  # default path if mounted

    import_sql(filepath)
