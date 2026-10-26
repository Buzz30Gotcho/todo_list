# Image Python utilisée pour exécuter l'API.
FROM python:3.12-slim

# Évite les fichiers Python inutiles et affiche les logs immédiatement.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Tous les fichiers et toutes les commandes suivants utilisent /app.
WORKDIR /app

# Installe les bibliothèques nécessaires à l'API.
COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt  -r requirements-dev.txt

# Ajoute le code du backend dans l'image.
COPY app ./app
COPY tests ./tests

# Port utilisé par FastAPI à l'intérieur du conteneur.
EXPOSE 8000

# Lance uvicorn sur le port 8000, accessible depuis les autres conteneurs.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
