import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getStockSummary } from "../../api/stock";
import { listOutlets } from "../../api/outlets";
import { listProducts } from "../../api/products";
import { Outlet, Product } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SummaryRow { outlet_id: string; product_id: string; quantity: number; }

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");

  useEffect(() => {
    Promise.all([getStockSummary(), listOutlets(), listProducts(true)]).then(([s, o, p]) => {
      setSummary(s.data); setOutlets(o.data); setProducts(p.data);
    });
  }, []);

  const filtered = selectedOutlet === "all" ? summary : summary.filter(r => r.outlet_id === selectedOutlet);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Stock Dashboard</h1>
          <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Outlets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outlets</SelectItem>
              {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Outlet", "Product", "SKU", "Unit", "Current Stock"].map(h => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => {
                  const outlet = outlets.find(o => o.id === r.outlet_id);
                  const product = products.find(p => p.id === r.product_id);
                  return (
                    <TableRow key={`${r.outlet_id}-${r.product_id}`}>
                      <TableCell>{outlet?.name ?? r.outlet_id}</TableCell>
                      <TableCell className="font-medium">{product?.name ?? r.product_id}</TableCell>
                      <TableCell className="text-slate-500">{product?.sku ?? "—"}</TableCell>
                      <TableCell className="text-slate-500">{product?.unit ?? "—"}</TableCell>
                      <TableCell className={cn("font-semibold", r.quantity < 0 ? "text-red-600" : "text-slate-900")}>
                        {r.quantity}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                      No stock data yet. Add products and record stock movements to see data here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
