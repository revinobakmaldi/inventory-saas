import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listOutlets, createOutlet, updateOutlet } from "../../api/outlets";
import { Outlet } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => listOutlets().then(r => setOutlets(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createOutlet({ name, address });
    setName(""); setAddress("");
    await load();
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Outlets</h1>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Add Outlet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 min-w-[180px]">
                <Label>Outlet Name</Label>
                <Input placeholder="e.g. Toko Maju" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5 min-w-[220px]">
                <Label>Address (optional)</Label>
                <Input placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading}>Add Outlet</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "Address", "Status", "Action"].map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-slate-500">{o.address ?? "—"}</TableCell>
                    <TableCell>
                      {o.is_active
                        ? <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                        : <Badge variant="outline" className="text-slate-400">Inactive</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => updateOutlet(o.id, { is_active: !o.is_active }).then(load)}>
                        {o.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {outlets.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-10">No outlets yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
