import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ReactNode, useState } from "react";
import { SquaresFour, Storefront, Users, Package, ClockCounterClockwise, SignOut, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: SquaresFour },
  { to: "/admin/outlets", label: "Outlets", icon: Storefront },
  { to: "/admin/users", label: "Staff", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/history", label: "History", icon: ClockCounterClockwise },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-6 h-6 rounded bg-[#1a1a2e] flex items-center justify-center">
          <Package className="h-3.5 w-3.5 text-white" weight="fill" />
        </div>
        <span className="font-semibold text-slate-900 text-sm">Inventory SaaS</span>
      </div>
      <p className="text-xs text-slate-400 px-2 mb-4 truncate">{user?.name}</p>
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
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
        <SignOut className="h-4 w-4" />
        Logout
      </Button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-56 bg-white border-r border-slate-200 flex-col p-4 shrink-0">
        <SidebarContent />
      </nav>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col p-4 z-50">
            <button
              className="self-end mb-4 text-slate-400 hover:text-slate-700"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </nav>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button onClick={() => setOpen(true)} className="text-slate-600 hover:text-slate-900">
            <List className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1a1a2e] flex items-center justify-center">
              <Package className="h-3 w-3 text-white" weight="fill" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Inventory SaaS</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
