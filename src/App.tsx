import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";
import BottomNav from "./components/BottomNav";

export default function App() {
  const { pathname } = useLocation();
  const showChrome = !pathname.startsWith("/showcase");
  return (
    <div className="relative mx-auto flex h-full max-w-lg flex-col">
      {showChrome && (
        <header className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-bold">오사카 회화</Link>
          <Link to="/settings" aria-label="설정"><SettingsIcon size={20} /></Link>
        </header>
      )}
      <main className={`flex-1 overflow-y-auto ${showChrome ? "pb-16" : ""}`}>
        <Outlet />
      </main>
      {showChrome && <BottomNav />}
    </div>
  );
}
