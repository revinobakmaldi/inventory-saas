import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import require_admin
from app.models.user import User, UserRole, UserOutlet
from app.models.outlet import Outlet
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import hash_password

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).filter(
        User.distributor_id == admin.distributor_id,
        User.role == UserRole.STAFF,
    ).all()
    result = []
    for u in users:
        outlet_id = u.user_outlets[0].outlet_id if u.user_outlets else None
        result.append(UserResponse(
            id=u.id, name=u.name, email=u.email, role=u.role,
            outlet_id=outlet_id, created_at=u.created_at,
        ))
    return result

@router.post("/", response_model=UserResponse)
def create_staff(body: UserCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")

    outlet = db.get(Outlet, body.outlet_id)
    if not outlet or outlet.distributor_id != admin.distributor_id:
        raise HTTPException(404, "Outlet not found")

    user = User(
        distributor_id=admin.distributor_id,
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.STAFF,
    )
    db.add(user)
    db.flush()
    db.add(UserOutlet(user_id=user.id, outlet_id=body.outlet_id))
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=user.id, name=user.name, email=user.email, role=user.role,
        outlet_id=body.outlet_id, created_at=user.created_at,
    )
