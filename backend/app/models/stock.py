import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum

class LedgerType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"

class StockLedger(Base):
    __tablename__ = "stock_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    outlet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("outlets.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)
    type: Mapped[LedgerType] = mapped_column(Enum(LedgerType))
    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    notes: Mapped[str | None] = mapped_column(String(500))
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    outlet: Mapped["Outlet"] = relationship(back_populates="stock_entries")
    product: Mapped["Product"] = relationship(back_populates="stock_entries")
    created_by_user: Mapped["User"] = relationship(back_populates="stock_entries")
