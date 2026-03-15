import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    distributor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("distributors.id"))
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    distributor: Mapped["Distributor"] = relationship(back_populates="users")
    user_outlets: Mapped[list["UserOutlet"]] = relationship(back_populates="user")
    stock_entries: Mapped[list["StockLedger"]] = relationship(back_populates="created_by_user")

class UserOutlet(Base):
    __tablename__ = "user_outlets"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    outlet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("outlets.id"), primary_key=True)

    user: Mapped["User"] = relationship(back_populates="user_outlets")
    outlet: Mapped["Outlet"] = relationship(back_populates="user_outlets")
