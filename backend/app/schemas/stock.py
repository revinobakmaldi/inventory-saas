import uuid
import enum
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.stock import LedgerType

class StockEntryType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    COUNT = "COUNT"

class StockEntryRequest(BaseModel):
    product_id: uuid.UUID
    type: StockEntryType
    quantity: float
    notes: str | None = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v

class StockEntryResponse(BaseModel):
    id: uuid.UUID
    outlet_id: uuid.UUID
    product_id: uuid.UUID
    type: LedgerType
    quantity: float
    notes: str | None
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}

class StockSummaryItem(BaseModel):
    outlet_id: uuid.UUID
    product_id: uuid.UUID
    quantity: float

class StockHistoryItem(BaseModel):
    id: uuid.UUID
    outlet_id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    outlet_name: str
    type: LedgerType
    quantity: float
    notes: str | None
    created_by_name: str
    created_at: datetime
