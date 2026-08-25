from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _valid_payload(**overrides):
    payload = {
        "needs_immediate_help": False,
        "category": "animal_sighting",
        "latitude": 10.1004,
        "longitude": 77.0803,
        "location_description": None,
        "location_accuracy_low": False,
        "photo_url": None,
        "notes": "Herd of 4 near the paddy field",
    }
    payload.update(overrides)
    return payload


def test_create_incident_with_coordinates_returns_201():
    response = client.post("/incidents", json=_valid_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "submitted"
    assert body["category"] == "animal_sighting"
    assert body["id"]


def test_create_incident_with_only_location_description_succeeds():
    payload = _valid_payload(latitude=None, longitude=None, location_description="Near the east field, Chinnakanal")
    response = client.post("/incidents", json=payload)
    assert response.status_code == 201


def test_create_incident_without_any_location_info_fails_validation():
    payload = _valid_payload(latitude=None, longitude=None, location_description=None)
    response = client.post("/incidents", json=payload)
    assert response.status_code == 422


def test_create_incident_with_invalid_latitude_fails_validation():
    payload = _valid_payload(latitude=999)
    response = client.post("/incidents", json=payload)
    assert response.status_code == 422


def test_get_incident_returns_created_incident():
    create_resp = client.post("/incidents", json=_valid_payload())
    incident_id = create_resp.json()["id"]

    get_resp = client.get(f"/incidents/{incident_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == incident_id


def test_get_nonexistent_incident_returns_404():
    response = client.get("/incidents/does-not-exist")
    assert response.status_code == 404
