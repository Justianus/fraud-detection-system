import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Upload, 
  BarChart3,
  Shield
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Claims",
    href: "/claims",
    icon: FileText,
  },
  {
    title: "New Claim",
    href: "/new-claim",
    icon: Plus,
  },
  {
    title: "Batch Upload",
    href: "/batch-upload",
    icon: Upload,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-81px)] shadow-sm">
      <nav className="p-6 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

