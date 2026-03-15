def _setup(admin_client):
    outlet_id = admin_client.post("/api/outlets/", json={"name": "Toko X"}).json()["id"]
    product_id = admin_client.post("/api/products/", json={"name": "Aqua", "sku": "AQ1", "unit": "botol"}).json()["id"]
    return outlet_id, product_id

def test_record_stock_in(admin_client):
    outlet_id, product_id = _setup(admin_client)
    r = admin_client.post(f"/api/stock/{outlet_id}/entries", json={
        "product_id": product_id, "type": "IN", "quantity": 24.0
    })
    assert r.status_code == 200
    assert r.json()["quantity"] == 24.0

def test_record_stock_out_negates(admin_client):
    outlet_id, product_id = _setup(admin_client)
    admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "IN", "quantity": 24.0})
    r = admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "OUT", "quantity": 10.0})
    assert r.json()["quantity"] == -10.0

def test_stock_count_generates_adjustment(admin_client):
    outlet_id, product_id = _setup(admin_client)
    admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "IN", "quantity": 50.0})
    r = admin_client.post(f"/api/stock/{outlet_id}/entries", json={
        "product_id": product_id, "type": "COUNT", "quantity": 48.0
    })
    assert r.json()["type"] == "ADJUSTMENT"
    assert r.json()["quantity"] == -2.0

def test_current_stock_calculation(admin_client):
    outlet_id, product_id = _setup(admin_client)
    admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "IN", "quantity": 24.0})
    admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "OUT", "quantity": 5.0})
    r = admin_client.get(f"/api/stock/{outlet_id}/current")
    item = next(i for i in r.json() if i["product_id"] == product_id)
    assert item["quantity"] == 19.0

def test_negative_quantity_rejected(admin_client):
    outlet_id, product_id = _setup(admin_client)
    r = admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "IN", "quantity": -5.0})
    assert r.status_code == 422

def test_stock_history_paginated(admin_client):
    outlet_id, product_id = _setup(admin_client)
    for _ in range(5):
        admin_client.post(f"/api/stock/{outlet_id}/entries", json={"product_id": product_id, "type": "IN", "quantity": 1.0})
    r = admin_client.get("/api/stock/history?page=1&page_size=3")
    assert len(r.json()) == 3
