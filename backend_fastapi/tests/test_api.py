import pytest

from fastapi.testclient import TestClient

from app import models
from app.database import engine
from app.main import app

# Fournit un client HTTP avec une table vide avant chaque test.
@pytest.fixture()
def client():
    with engine.begin() as connection:
        connection.execute(models.Todo.__table__.delete())

    with TestClient(app) as test_client:
        yield test_client

# Vérifie le cycle complet : créer, lister, modifier, supprimer.
def test_todo_crud(client):
    created = client.post(
        "/todos",
        json={"title": "Tester l'API", "description": "Test simple"},
    )
    assert created.status_code == 201
    todo = created.json()
    assert todo["title"] == "Tester l'API"

    listed = client.get("/todos")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.put(
        f"/todos/{todo['id']}",
        json={"completed": True},
    )
    assert updated.status_code == 200
    assert updated.json()["completed"] is True

    deleted = client.delete(f"/todos/{todo['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/todos/{todo['id']}").status_code == 404

# Vérifie qu'un titre vide est refusé.
def test_rejects_blank_title(client):
    response = client.post("/todos", json={"title": "   "})

    assert response.status_code == 400
    assert response.json()["detail"] == "Le titre est obligatoire"
