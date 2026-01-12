import os
import requests
import re

# Configuration
SUMMARY_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"
ICON_BASE_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/"
OUTPUT_FOLDER = "champion_icons"

def clean_filename(name):
    """Supprime les caractères spéciaux pour éviter les erreurs de fichier."""
    # Enlève tout ce qui n'est pas lettre, chiffre ou espace, puis remplace les espaces par rien
    return re.sub(r'[^a-zA-Z0-9]', '', name)

def download_and_rename_icons():
    # 1. Créer le dossier
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    # 2. Récupérer la liste des champions
    print("Accès à la base de données CommunityDragon...")
    response = requests.get(SUMMARY_URL)
    champions = response.json()

    for champ in champions:
        champ_id = champ['id']
        raw_name = champ['name']
        
        if champ_id == -1: continue # On ignore l'icône vide

        # Nettoyage du nom (ex: "Bel'Veth" -> "BelVeth")
        safe_name = clean_filename(raw_name)
        file_path = os.path.join(OUTPUT_FOLDER, f"{safe_name}.png")

        # URL de téléchargement (toujours basée sur l'ID)
        url = f"{ICON_BASE_URL}{champ_id}.png"

        try:
            img_response = requests.get(url)
            if img_response.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(img_response.content)
                print(f"Succès : {raw_name} -> {safe_name}.png")
            else:
                print(f"⚠️ Image introuvable pour {raw_name} (ID: {champ_id})")
        except Exception as e:
            print(f"❌ Erreur lors du téléchargement de {raw_name} : {e}")

    print(f"\nTerminé ! Tes images sont renommées dans le dossier '{OUTPUT_FOLDER}'.")

if __name__ == "__main__":
    download_and_rename_icons()