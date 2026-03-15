from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from jose import JWTError
from app.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.distributor import Distributor
from app.models.user import User, UserRole
from app.deps import get_current_user
from app.config import settings
import uuid as _uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.admin_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    distributor = Distributor(name=body.distributor_name, billing_email=body.billing_email)
    db.add(distributor)
    db.flush()

    user = User(
        distributor_id=distributor.id,
        name=body.admin_name,
        email=body.admin_email,
        password_hash=hash_password(body.password),
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(str(user.id), user.role, str(distributor.id))
    refresh_token = create_refresh_token(str(user.id))
    response.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=900)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax",
                        max_age=settings.refresh_token_expire_days * 86400, path="/api/auth/refresh")
    return {"access_token": access_token}

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(str(user.id), user.role, str(user.distributor_id))

    if user.role == UserRole.ADMIN:
        refresh_token = create_refresh_token(str(user.id))
        response.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=900)
        response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax",
                            max_age=settings.refresh_token_expire_days * 86400, path="/api/auth/refresh")

    return {"access_token": access_token}

@router.post("/refresh", response_model=TokenResponse)
def refresh(response: Response, db: Session = Depends(get_db), refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user = db.get(User, _uuid.UUID(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(str(user.id), user.role, str(user.distributor_id))
    response.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=900)
    return {"access_token": access_token}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    outlet_id = current_user.user_outlets[0].outlet_id if current_user.user_outlets else None
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "distributor_id": str(current_user.distributor_id),
        "outlet_id": str(outlet_id) if outlet_id else None,
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}
