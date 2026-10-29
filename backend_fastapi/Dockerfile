# Dépendances communes aux images d'exécution et de test.
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Installe uniquement les dépendances nécessaires à l'application.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crée un utilisateur non-root commun aux deux images.
RUN groupadd -r fastapi && useradd -r -g fastapi fastapi

# Image utilisée uniquement pour exécuter les tests.
FROM base AS test
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY --chown=fastapi:fastapi app ./app
COPY --chown=fastapi:fastapi tests ./tests
USER fastapi
CMD ["python", "-m", "pytest", "-p", "no:cacheprovider"]

# Image d'exécution : elle ne contient ni pytest ni les fichiers de test.
FROM base AS runtime
COPY --chown=fastapi:fastapi app ./app
USER fastapi

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
