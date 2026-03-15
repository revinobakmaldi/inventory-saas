def test_create_and_list_outlet(admin_client):
    r = admin_client.post("/api/outlets/", json={"name": "Toko A", "address": "Jl. Sudirman 1"})
    assert r.status_code == 200
    assert r.json()["name"] == "Toko A"
    assert r.json()["is_active"] is True

    r = admin_client.get("/api/outlets/")
    assert r.status_code == 200
    assert len(r.json()) == 1

def test_deactivate_outlet(admin_client):
    r = admin_client.post("/api/outlets/", json={"name": "Toko B"})
    outlet_id = r.json()["id"]
    r = admin_client.patch(f"/api/outlets/{outlet_id}", json={"is_active": False})
    assert r.json()["is_active"] is False

def test_unauthenticated_cannot_access_outlets(client):
    r = client.get("/api/outlets/")
    assert r.status_code == 401
