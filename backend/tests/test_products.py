def test_create_and_list_products(admin_client):
    r = admin_client.post("/api/products/", json={"name": "Aqua 600ml", "sku": "AQ600", "unit": "botol"})
    assert r.status_code == 200
    assert r.json()["sku"] == "AQ600"

    r = admin_client.get("/api/products/")
    assert len(r.json()) == 1

def test_get_product_by_id(admin_client):
    pid = admin_client.post("/api/products/", json={"name": "X", "sku": "X001", "unit": "pcs"}).json()["id"]
    r = admin_client.get(f"/api/products/{pid}")
    assert r.status_code == 200

def test_deactivate_product(admin_client):
    pid = admin_client.post("/api/products/", json={"name": "Y", "sku": "Y001", "unit": "pcs"}).json()["id"]
    r = admin_client.patch(f"/api/products/{pid}", json={"is_active": False})
    assert r.json()["is_active"] is False
    r = admin_client.get("/api/products/")
    assert all(p["id"] != pid for p in r.json())

def test_qr_pdf_download(admin_client):
    admin_client.post("/api/products/", json={"name": "Z", "sku": "Z001", "unit": "pcs"})
    r = admin_client.get("/api/products/qr/pdf")
    assert r.status_code == 200
    assert "application/pdf" in r.headers["content-type"]
