import psycopg2

try:
    conn = psycopg2.connect(
        host="db-iwocs-acjj.c9y8c02yuttu.eu-west-3.rds.amazonaws.com",
        database="postgres",
        user="postgres",
        password='bX$2S5e#YxW~PU*J!FE*7vr>]W5D',
        port="5432"
    )
    print("Connexion réussie !")
    print(f"Statut : {conn.status}")
    conn.close()

except Exception as e:
    print(f"Erreur : {e}")