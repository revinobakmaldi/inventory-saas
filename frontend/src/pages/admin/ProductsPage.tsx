import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listProducts, createProduct, updateProduct, downloadQRPdf } from "../../api/products";
import { Product } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", sku: "", unit: "" });
  const [loading, setLoading] = useState(false);

  const load = () => listProducts(true).then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createProduct(form);
    setForm({ name: "", sku: "", unit: "" });
    await load();
    setLoading(false);
  };

  const handleDownloadQR = async () => {
    const r = await downloadQRPdf();
    const url = URL.createObjectURL(r.data);
    const a = document.createElement("a");
    a.href = url; a.download = "qr-labels.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <Button variant="outline" onClick={handleDownloadQR}>
            <Download className="h-4 w-4 mr-2" />
            QR Labels PDF
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 min-w-[200px]">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Aqua 600ml" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5 min-w-[120px]">
                <Label>SKU</Label>
                <Input placeholder="e.g. AQ-600" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
              </div>
              <div className="space-y-1.5 min-w-[120px]">
                <Label>Unit</Label>
                <Input placeholder="e.g. botol, pcs" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading}>Add Product</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "SKU", "Unit", "Status", "Action"].map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} className={cn(!p.is_active && "opacity-50")}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="text-slate-500">{p.unit}</TableCell>
                    <TableCell>
                      {p.is_active
                        ? <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                        : <Badge variant="outline" className="text-slate-400">Inactive</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => updateProduct(p.id, { is_active: !p.is_active }).then(load)}>
                        {p.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-10">No products yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
