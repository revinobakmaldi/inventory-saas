import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.user import User, UserRole, UserOutlet
from app.models.outlet import Outlet
from app.models.stock import StockLedger, LedgerType
from app.models.product import Product
from app.services.stock import record_in, record_out, record_count, get_stock_summary
from app.schemas.stock import StockEntryRequest, StockEntryResponse, StockSummaryItem, StockHistoryItem, StockEntryType
from sqlalchemy import func

router = APIRouter(prefix="/stock", tags=["stock"])

def _assert_outlet_access(user: User, outlet_id: uuid.UUID, db: Session):
    outlet = db.get(Outlet, outlet_id)
    if not outlet or outlet.distributor_id != user.distributor_id:
        raise HTTPException(404, "Outlet not found")
    if user.role == UserRole.STAFF:
        access = db.query(UserOutlet).filter(
            UserOutlet.user_id == user.id, UserOutlet.outlet_id == outlet_id
        ).first()
        if not access:
            raise HTTPException(403, "No access to this outlet")

@router.post("/{outlet_id}/entries", response_model=StockEntryResponse)
def record_stock(
    outlet_id: uuid.UUID,
    body: StockEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_outlet_access(current_user, outlet_id, db)
    product = db.get(Product, body.product_id)
    if not product or product.distributor_id != current_user.distributor_id:
        raise HTTPException(404, "Product not found")
    if not product.is_active:
        raise HTTPException(400, "Product is inactive")

    if body.type == StockEntryType.IN:
        return record_in(db, outlet_id, body.product_id, body.quantity, body.notes, current_user)
    elif body.type == StockEntryType.OUT:
        return record_out(db, outlet_id, body.product_id, body.quantity, body.notes, current_user)
    elif body.type == StockEntryType.COUNT:
        return record_count(db, outlet_id, body.product_id, body.quantity, current_user)

@router.get("/admin/summary", response_model=list[StockSummaryItem])
def stock_summary(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_stock_summary(db, admin.distributor_id)

@router.get("/{outlet_id}/current")
def outlet_current_stock(
    outlet_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_outlet_access(current_user, outlet_id, db)
    rows = db.query(
        StockLedger.product_id,
        func.sum(StockLedger.quantity).label("quantity"),
    ).filter(StockLedger.outlet_id == outlet_id).group_by(StockLedger.product_id).all()

    result = []
    for r in rows:
        product = db.get(Product, r.product_id)
        result.append({
            "product_id": str(r.product_id),
            "product_name": product.name if product else "Unknown",
            "sku": product.sku if product else "",
            "unit": product.unit if product else "",
            "quantity": float(r.quantity),
        })
    return result

@router.get("/history", response_model=list[StockHistoryItem])
def stock_history(
    outlet_id: uuid.UUID | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from app.models.outlet import Outlet as OutletModel
    q = db.query(StockLedger).join(
        OutletModel, OutletModel.id == StockLedger.outlet_id
    ).filter(OutletModel.distributor_id == admin.distributor_id)

    if outlet_id:
        q = q.filter(StockLedger.outlet_id == outlet_id)
    if product_id:
        q = q.filter(StockLedger.product_id == product_id)
    if from_date:
        q = q.filter(StockLedger.created_at >= datetime.combine(from_date, datetime.min.time()))
    if to_date:
        q = q.filter(StockLedger.created_at <= datetime.combine(to_date, datetime.max.time()))

    entries = q.order_by(StockLedger.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for e in entries:
        product = db.get(Product, e.product_id)
        outlet = db.get(OutletModel, e.outlet_id)
        user = db.get(User, e.created_by)
        result.append(StockHistoryItem(
            id=e.id, outlet_id=e.outlet_id, product_id=e.product_id,
            product_name=product.name if product else "Unknown",
            outlet_name=outlet.name if outlet else "Unknown",
            type=e.type, quantity=float(e.quantity),
            notes=e.notes, created_by_name=user.name if user else "Unknown",
            created_at=e.created_at,
        ))
    return result
