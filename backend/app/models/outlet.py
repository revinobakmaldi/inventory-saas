import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Outlet(Base):
    __tablename__ = "outlets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    distributor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("distributors.id"))
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    distributor: Mapped["Distributor"] = relationship(back_populates="outlets")
    user_outlets: Mapped[list["UserOutlet"]] = relationship(back_populates="outlet")
    stock_entries: Mapped[list["StockLedger"]] = relationship(back_populates="outlet")
