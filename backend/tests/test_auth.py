def test_signup_creates_distributor_and_admin(client):
    r = client.post("/api/auth/signup", json={
        "distributor_name": "Maju Jaya",
        "billing_email": "billing@majujaya.com",
        "admin_name": "Budi",
        "admin_email": "budi@majujaya.com",
        "password": "secret123",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_signup_duplicate_email_rejected(client):
    payload = {
        "distributor_name": "A", "billing_email": "b@b.com",
        "admin_name": "A", "admin_email": "same@test.com", "password": "pw"
    }
    client.post("/api/auth/signup", json=payload)
    r = client.post("/api/auth/signup", json=payload)
    assert r.status_code == 400

def test_login_valid(client):
    client.post("/api/auth/signup", json={
        "distributor_name": "X", "billing_email": "x@x.com",
        "admin_name": "X", "admin_email": "a@x.com", "password": "pw123"
    })
    r = client.post("/api/auth/login", json={"email": "a@x.com", "password": "pw123"})
    assert r.status_code == 200

def test_login_wrong_password(client):
    client.post("/api/auth/signup", json={
        "distributor_name": "Y", "billing_email": "y@y.com",
        "admin_name": "Y", "admin_email": "b@y.com", "password": "pw123"
    })
    r = client.post("/api/auth/login", json={"email": "b@y.com", "password": "wrong"})
    assert r.status_code == 401

def test_protected_endpoint_requires_auth(client):
    r = client.get("/api/outlets/")
    assert r.status_code in [401, 404]

def test_me_returns_current_user(admin_client):
    r = admin_client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["role"] == "ADMIN"
