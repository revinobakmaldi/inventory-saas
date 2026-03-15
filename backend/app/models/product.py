import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    distributor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("distributors.id"))
    name: Mapped[str] = mapped_column(String(255))
    sku: Mapped[str] = mapped_column(String(100))
    unit: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("distributor_id", "sku", name="uq_product_sku_per_distributor"),)

    distributor: Mapped["Distributor"] = relationship(back_populates="products")
    stock_entries: Mapped[list["StockLedger"]] = relationship(back_populates="product")
