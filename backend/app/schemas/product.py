import uuid
from datetime import datetime
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    sku: str
    unit: str

class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    unit: str | None = None
    is_active: bool | None = None

class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    sku: str
    unit: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
