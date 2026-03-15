import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import require_admin
from app.models.outlet import Outlet
from app.models.user import User
from app.schemas.outlet import OutletCreate, OutletUpdate, OutletResponse

router = APIRouter(prefix="/outlets", tags=["outlets"])

@router.get("/", response_model=list[OutletResponse])
def list_outlets(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Outlet).filter(Outlet.distributor_id == admin.distributor_id).all()

@router.post("/", response_model=OutletResponse)
def create_outlet(body: OutletCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    outlet = Outlet(distributor_id=admin.distributor_id, **body.model_dump())
    db.add(outlet)
    db.commit()
    db.refresh(outlet)
    return outlet

@router.patch("/{outlet_id}", response_model=OutletResponse)
def update_outlet(outlet_id: uuid.UUID, body: OutletUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    outlet = db.get(Outlet, outlet_id)
    if not outlet or outlet.distributor_id != admin.distributor_id:
        raise HTTPException(404, "Outlet not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(outlet, k, v)
    db.commit()
    db.refresh(outlet)
    return outlet
