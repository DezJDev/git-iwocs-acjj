import psycopg2

params = {
    "host": "db-iwocs-acjj.c9y8c02yuttu.eu-west-3.rds.amazonaws.com",
    "database": "postgres",
    "user": "postgres",
    "password": "bX$2S5e#YxW~PU*J!FE*7vr>]W5D",
    "port": "5432"
}

def import_csv(file_path):
    with psycopg2.connect(**params) as conn:
        with conn.cursor() as cur:
            with open(file_path, 'r', encoding='utf-8') as f:
                sql = "COPY champion(championName, role, genre, espece, ressource, range, regions, releaseDate, iconUrl) FROM STDIN WITH CSV HEADER"
                cur.copy_expert(sql, f)
            conn.commit()
            print("Importation terminée !")

import_csv('data.csv')