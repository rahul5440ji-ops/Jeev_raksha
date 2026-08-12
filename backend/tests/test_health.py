from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "jeevraksha-backend"


def test_health_check_reports_env():
    response = client.get("/health")
    assert "env" in response.json()
