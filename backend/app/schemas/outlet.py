import uuid
from datetime import datetime
from pydantic import BaseModel

class OutletCreate(BaseModel):
    name: str
    address: str | None = None

class OutletUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    is_active: bool | None = None

class OutletResponse(BaseModel):
    id: uuid.UUID
    name: str
    address: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
