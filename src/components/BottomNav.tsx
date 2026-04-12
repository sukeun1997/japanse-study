import { NavLink } from "react-router-dom";
import { BookOpen, Map, Star } from "lucide-react";

const items = [
  { to: "/study",     icon: BookOpen, label: "학습" },
  { to: "/browse",    icon: Map,      label: "여행" },
  { to: "/favorites", icon: Star,     label: "즐겨찾기" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
      <ul className="mx-auto flex max-w-lg">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? "text-sky-600" : "text-gray-500 dark:text-neutral-400"
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
