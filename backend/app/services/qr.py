import io
import uuid
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as pdf_canvas

LABEL_W = 63.5 * mm
LABEL_H = 38.1 * mm
COLS = 3
ROWS = 7

def generate_qr_image(product_id: uuid.UUID, base_url: str) -> bytes:
    url = f"{base_url}/scan?p={product_id}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def generate_qr_pdf(products: list[dict], base_url: str) -> bytes:
    buf = io.BytesIO()
    c = pdf_canvas.Canvas(buf, pagesize=A4)
    page_w, page_h = A4
    margin_x = (page_w - COLS * LABEL_W) / 2
    margin_y = (page_h - ROWS * LABEL_H) / 2

    for i, product in enumerate(products):
        col = i % COLS
        row = (i // COLS) % ROWS
        if i > 0 and col == 0 and row == 0:
            c.showPage()

        x = margin_x + col * LABEL_W
        y = page_h - margin_y - (row + 1) * LABEL_H

        qr_img = generate_qr_image(product["id"], base_url)
        qr_buf = ImageReader(io.BytesIO(qr_img))
        c.drawImage(qr_buf, x + 2*mm, y + 2*mm, width=LABEL_H - 4*mm, height=LABEL_H - 4*mm)

        text_x = x + LABEL_H + 2*mm
        c.setFont("Helvetica-Bold", 8)
        c.drawString(text_x, y + LABEL_H - 10*mm, product["name"][:22])
        c.setFont("Helvetica", 7)
        c.drawString(text_x, y + LABEL_H - 15*mm, f"SKU: {product['sku']}")

    c.save()
    return buf.getvalue()
