import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fieldLabels: Record<string, string> = {
  distributor_name: "Distributor / Company Name",
  billing_email: "Billing Email",
  admin_name: "Your Name",
  admin_email: "Admin Email",
  password: "Password",
};

export default function SignupPage() {
  const [form, setForm] = useState({ distributor_name: "", billing_email: "", admin_name: "", admin_email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded bg-[#1a1a2e]" />
            <span className="font-semibold text-slate-900">Inventory SaaS</span>
          </div>
          <CardTitle className="text-xl">Create account</CardTitle>
          <p className="text-sm text-slate-500">Set up your distributor account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {(Object.keys(form) as (keyof typeof form)[]).map(field => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Input
                  id={field}
                  type={field.includes("email") ? "email" : field === "password" ? "password" : "text"}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  required
                />
              </div>
            ))}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-slate-500 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1a1a2e] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
