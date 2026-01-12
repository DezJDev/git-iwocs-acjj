import psycopg2
from psycopg2.extras import RealDictCursor

params = {
    "host": "db-iwocs-acjj.c9y8c02yuttu.eu-west-3.rds.amazonaws.com",
    "database": "postgres",
    "user": "postgres",
    "password": "bX$2S5e#YxW~PU*J!FE*7vr>]W5D",
    "port": "5432"
}

def fetch_champions():
    try:
        conn = psycopg2.connect(**params)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT championName, role, regions, iconUrl FROM champion LIMIT 5;")
        rows = cur.fetchall()
        for row in rows:
            print(f"Nom: {row['championname']} | Rôle: {row['role']} | URL: {row['iconurl']}")
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Erreur lors du fetch : {e}")

if __name__ == "__main__":
    fetch_champions()