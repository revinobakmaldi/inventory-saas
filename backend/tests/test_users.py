def test_create_staff(admin_client):
    outlet_id = admin_client.post("/api/outlets/", json={"name": "Toko A"}).json()["id"]
    r = admin_client.post("/api/users/", json={
        "name": "Siti", "email": "siti@test.com",
        "password": "pw123", "outlet_id": outlet_id,
    })
    assert r.status_code == 200
    assert r.json()["role"] == "STAFF"
    assert r.json()["outlet_id"] == outlet_id

def test_list_users(admin_client):
    outlet_id = admin_client.post("/api/outlets/", json={"name": "Toko B"}).json()["id"]
    admin_client.post("/api/users/", json={"name": "Andi", "email": "andi@test.com", "password": "pw", "outlet_id": outlet_id})
    r = admin_client.get("/api/users/")
    assert r.status_code == 200
    assert len(r.json()) >= 1
