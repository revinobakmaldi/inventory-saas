import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../components/StaffLayout";
import { client } from "../../api/client";
import { recordStock } from "../../api/stock";
import { useAuth } from "../../hooks/useAuth";
import { Product, StockEntryType } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function StockEntryPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product_id");
  const [product, setProduct] = useState<Product | null>(null);
  const [type, setType] = useState<StockEntryType>("IN");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      client.get<Product>(`/products/${productId}`)
        .then(r => setProduct(r.data))
        .catch(() => setError("Product not found"));
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.outlet_id || !productId) return;
    setLoading(true);
    try {
      await recordStock(user.outlet_id, {
        product_id: productId,
        type,
        quantity: parseFloat(quantity),
        notes: notes || undefined,
      });
      navigate("/staff");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to record");
    } finally {
      setLoading(false);
    }
  };

  if (!productId) {
    return (
      <StaffLayout>
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-sm mb-3">No product selected.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/staff/scan")}>Scan a product</Button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Stock</h2>

      {product && (
        <Card className="mb-4 bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500 mt-1">SKU: {product.sku} · Unit: {product.unit}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Type</Label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["IN", "OUT", "COUNT"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  type === t
                    ? "bg-[#1a1a2e] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {t === "COUNT" ? "Count" : t === "IN" ? "Stock In" : "Stock Out"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty">{type === "COUNT" ? "Actual Count" : "Quantity"}</Label>
          <Input
            id="qty"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
            placeholder="0"
            className="text-lg h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Received from supplier"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base bg-[#1a1a2e] hover:bg-[#2d2d4e]"
        >
          {loading ? "Saving..." : "Submit"}
        </Button>
      </form>
    </StaffLayout>
  );
}
