import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/StaffLayout";
import { getOutletCurrentStock } from "../../api/stock";
import { useAuth } from "../../hooks/useAuth";
import { StockCurrentItem } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, WifiSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function StaffHomePage() {
  const { user } = useAuth();
  const [stock, setStock] = useState<StockCurrentItem[]>([]);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user?.outlet_id) {
      getOutletCurrentStock(user.outlet_id)
        .then(r => setStock(r.data))
        .catch(() => setError("Failed to load stock"));
    }
  }, [user?.outlet_id]);

  return (
    <StaffLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Current Stock</h2>
        <Button
          size="sm"
          className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white"
          onClick={() => navigate("/staff/scan")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Record
        </Button>
      </div>

      {isOffline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm mb-4">
          <WifiSlash className="h-4 w-4 shrink-0" />
          No connection — reconnect to submit entries.
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {stock.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No stock recorded yet.</p>
          <p className="text-sm">Tap Record to start.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stock.map(item => (
            <Card key={item.product_id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.product_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-2xl font-bold", item.quantity < 0 ? "text-red-600" : "text-[#1a1a2e]")}>
                    {item.quantity}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{item.unit}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
