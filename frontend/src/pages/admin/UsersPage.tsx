import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listUsers, createUser } from "../../api/users";
import { listOutlets } from "../../api/outlets";
import { User, Outlet } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", outlet_id: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    listUsers().then(r => setUsers(r.data));
    listOutlets().then(r => setOutlets(r.data.filter(o => o.is_active)));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createUser(form);
    setForm({ name: "", email: "", password: "", outlet_id: "" });
    await load();
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Staff Accounts</h1>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 min-w-[160px]">
                <Label>Name</Label>
                <Input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5 min-w-[200px]">
                <Label>Email</Label>
                <Input type="email" placeholder="staff@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-1.5 min-w-[180px]">
                <Label>Outlet</Label>
                <Select value={form.outlet_id} onValueChange={v => setForm({ ...form, outlet_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading || !form.outlet_id}>Create Staff</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "Email", "Role"].map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{u.role}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-10">No staff accounts yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
