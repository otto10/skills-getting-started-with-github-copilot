import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_for_activity_success():
    email = "nuevo@mergington.edu"
    activity = "Chess Club"
    # Asegurarse de que el usuario no esté inscrito
    client.get("/activities")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]

def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_for_activity_not_found():
    email = "nuevo@mergington.edu"
    activity = "ActividadFalsa"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
