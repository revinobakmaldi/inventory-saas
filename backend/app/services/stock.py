import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.stock import StockLedger, LedgerType
from app.models.user import User

def get_current_stock(db: Session, outlet_id: uuid.UUID, product_id: uuid.UUID) -> float:
    result = db.query(func.sum(StockLedger.quantity)).filter(
        StockLedger.outlet_id == outlet_id,
        StockLedger.product_id == product_id,
    ).scalar()
    return float(result or 0)

def record_in(db: Session, outlet_id: uuid.UUID, product_id: uuid.UUID,
              quantity: float, notes: str | None, user: User) -> StockLedger:
    entry = StockLedger(
        outlet_id=outlet_id, product_id=product_id,
        type=LedgerType.IN, quantity=abs(quantity),
        notes=notes, created_by=user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def record_out(db: Session, outlet_id: uuid.UUID, product_id: uuid.UUID,
               quantity: float, notes: str | None, user: User) -> StockLedger:
    entry = StockLedger(
        outlet_id=outlet_id, product_id=product_id,
        type=LedgerType.OUT, quantity=-abs(quantity),
        notes=notes, created_by=user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def record_count(db: Session, outlet_id: uuid.UUID, product_id: uuid.UUID,
                 actual_count: float, user: User) -> StockLedger:
    expected = get_current_stock(db, outlet_id, product_id)
    delta = actual_count - expected
    note = f"Stock count by {user.name} on {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC. Expected: {expected}, Actual: {actual_count}"
    entry = StockLedger(
        outlet_id=outlet_id, product_id=product_id,
        type=LedgerType.ADJUSTMENT, quantity=delta,
        notes=note, created_by=user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_stock_summary(db: Session, distributor_id: uuid.UUID) -> list[dict]:
    from app.models.outlet import Outlet
    rows = db.query(
        StockLedger.outlet_id,
        StockLedger.product_id,
        func.sum(StockLedger.quantity).label("quantity"),
    ).join(Outlet, Outlet.id == StockLedger.outlet_id).filter(
        Outlet.distributor_id == distributor_id,
    ).group_by(StockLedger.outlet_id, StockLedger.product_id).all()
    return [{"outlet_id": r.outlet_id, "product_id": r.product_id, "quantity": float(r.quantity)} for r in rows]
