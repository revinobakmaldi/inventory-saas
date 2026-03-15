import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    outlet_id: uuid.UUID

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    outlet_id: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
