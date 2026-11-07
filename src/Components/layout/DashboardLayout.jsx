import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { SCHOOL_SHORT } from "../../config/appConfig";

// One layout for every module. Each module passes its own menu (constants/navigation.js).
export default function DashboardLayout({ nav, base }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 print:block print:h-auto">
      <Sidebar nav={nav} base={base} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-6xl"><Outlet /></div>
          <footer className="mx-auto mt-10 max-w-6xl border-t border-ink-100 pt-4 text-center text-xs text-ink-400">{SCHOOL_SHORT} Result Management System</footer>
        </main>
      </div>
    </div>
  );
}
