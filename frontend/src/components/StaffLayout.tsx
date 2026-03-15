import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ReactNode } from "react";
import { Package, ScanLine, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col bg-white">
      <header className="bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white/20" />
          <span className="font-semibold text-sm">Inventory</span>
        </div>
        <span className="text-sm text-white/70">{user?.name}</span>
      </header>
      <main className="flex-1 p-4 pb-20 bg-slate-50">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-slate-200 flex justify-around py-2 z-10">
        {[
          { to: "/staff", label: "Stock", icon: Package, exact: true },
          { to: "/staff/scan", label: "Scan", icon: ScanLine, exact: false },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/staff"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-6 py-1 text-xs transition-colors",
                isActive ? "text-[#1a1a2e] font-medium" : "text-slate-400"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={async () => { await logout(); navigate("/login"); }}
          className="flex flex-col items-center gap-1 px-6 py-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </div>
  );
}
