# Dépendances de l'image d'exécution.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Installe uniquement les dépendances nécessaires à l'application.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crée un utilisateur non-root commun aux deux images.
RUN groupadd -r fastapi && useradd -r -g fastapi fastapi

COPY --chown=fastapi:fastapi app ./app
USER fastapi

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
