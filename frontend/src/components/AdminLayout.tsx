import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ReactNode } from "react";
import { LayoutDashboard, Store, Users, Package, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/outlets", label: "Outlets", icon: Store },
  { to: "/admin/users", label: "Staff", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/history", label: "History", icon: History },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <nav className="w-56 bg-white border-r border-slate-200 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-6 h-6 rounded bg-[#1a1a2e]" />
          <span className="font-semibold text-slate-900 text-sm">Inventory SaaS</span>
        </div>
        <p className="text-xs text-slate-400 px-2 mb-4 truncate">{user?.name}</p>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
        <Button
          variant="ghost"
          className="justify-start gap-2.5 text-slate-500 hover:text-slate-900 px-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </nav>
      <main className="flex-1 p-8 min-w-0">{children}</main>
    </div>
  );
}
