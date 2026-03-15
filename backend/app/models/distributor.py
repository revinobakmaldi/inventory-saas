import uuid
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Distributor(Base):
    __tablename__ = "distributors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    billing_email: Mapped[str] = mapped_column(String(255), unique=True)
    subscription_plan: Mapped[str] = mapped_column(String(50), default="starter")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    outlets: Mapped[list["Outlet"]] = relationship(back_populates="distributor")
    users: Mapped[list["User"]] = relationship(back_populates="distributor")
    products: Mapped[list["Product"]] = relationship(back_populates="distributor")
