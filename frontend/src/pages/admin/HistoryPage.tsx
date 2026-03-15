import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getHistory } from "../../api/stock";
import { listOutlets } from "../../api/outlets";
import { listProducts } from "../../api/products";
import { StockHistoryItem, Outlet, Product } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const typeBadge = (type: string) => {
  if (type === "IN") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">IN</Badge>;
  if (type === "OUT") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">OUT</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">ADJ</Badge>;
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<StockHistoryItem[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({ outlet_id: "", product_id: "", from_date: "", to_date: "", page: 1, page_size: 50 });

  useEffect(() => {
    listOutlets().then(r => setOutlets(r.data));
    listProducts(true).then(r => setProducts(r.data));
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v !== 0));
    getHistory(params as any).then(r => setEntries(r.data));
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Stock History</h1>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <Select value={filters.outlet_id || "all"} onValueChange={v => setFilters({ ...filters, outlet_id: v === "all" ? "" : v, page: 1 })}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All Outlets" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.product_id || "all"} onValueChange={v => setFilters({ ...filters, product_id: v === "all" ? "" : v, page: 1 })}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All Products" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <input type="date" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value, page: 1 })}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="date" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value, page: 1 })}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Date", "Outlet", "Product", "Type", "Qty", "Notes", "By"].map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">{new Date(e.created_at).toLocaleString("id-ID")}</TableCell>
                    <TableCell>{e.outlet_name}</TableCell>
                    <TableCell className="font-medium">{e.product_name}</TableCell>
                    <TableCell>{typeBadge(e.type)}</TableCell>
                    <TableCell className="font-semibold">{e.quantity}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-500 text-xs">{e.notes ?? "—"}</TableCell>
                    <TableCell className="text-slate-500">{e.created_by_name}</TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-10">No entries found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">Page {filters.page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={entries.length < filters.page_size} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
