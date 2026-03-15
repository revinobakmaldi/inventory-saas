import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import require_admin, get_current_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.qr import generate_qr_pdf
from app.config import settings

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductResponse])
def list_products(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Product).filter(Product.distributor_id == current_user.distributor_id)
    if not include_inactive:
        q = q.filter(Product.is_active == True)
    return q.all()

# NOTE: /qr/pdf MUST be defined before /{product_id} to prevent FastAPI matching "qr" as a UUID
@router.get("/qr/pdf")
def download_qr_pdf(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    products = db.query(Product).filter(
        Product.distributor_id == admin.distributor_id,
        Product.is_active == True,
    ).all()
    pdf_bytes = generate_qr_pdf(
        [{"id": p.id, "name": p.name, "sku": p.sku} for p in products],
        base_url=settings.frontend_url,
    )
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=qr-labels.pdf"})

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.get(Product, product_id)
    if not product or product.distributor_id != current_user.distributor_id:
        raise HTTPException(404, "Product not found")
    return product

@router.post("/", response_model=ProductResponse)
def create_product(body: ProductCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    product = Product(distributor_id=admin.distributor_id, **body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: uuid.UUID, body: ProductUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    product = db.get(Product, product_id)
    if not product or product.distributor_id != admin.distributor_id:
        raise HTTPException(404, "Product not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product
