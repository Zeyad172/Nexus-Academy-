import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Upload,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMediaUrl } from "@/lib/utils";

interface DashboardSidebarProps {
  type: "student" | "instructor" | "admin";
}

const studentLinks = [
  { label: "Home", path: "/", icon: House },
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", path: "/dashboard/courses", icon: BookOpen },
  { label: "Progress", path: "/dashboard/progress", icon: Trophy },
  { label: "Certificates", path: "/dashboard/certificates", icon: Award },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

const instructorLinks = [
  { label: "Home", path: "/", icon: House },
  { label: "Overview", path: "/instructor", icon: LayoutDashboard },
  { label: "My Courses", path: "/instructor/courses", icon: BookOpen },
  { label: "Upload Course", path: "/instructor/upload", icon: Upload },
  { label: "Analytics", path: "/instructor/analytics", icon: BarChart3 },
  { label: "Reviews", path: "/instructor/reviews", icon: MessageSquare },
  { label: "Students", path: "/instructor/students", icon: Users },
  { label: "Revenue", path: "/instructor/revenue", icon: DollarSign },
  { label: "Settings", path: "/instructor/settings", icon: Settings },
];

const adminLinks = [
  { label: "Home", path: "/", icon: House },
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Courses", path: "/admin/courses", icon: BookOpen },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Enrollments", path: "/admin/enrollments", icon: Calendar },
  { label: "Categories", path: "/admin/categories", icon: LayoutDashboard },
  { label: "Payments", path: "/admin/payments", icon: DollarSign },
  { label: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export const SidebarContent = ({ 
  type, 
  collapsed = false, 
  onToggleCollapse,
  isMobile = false,
  onClose
}: { 
  type: "student" | "instructor" | "admin";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  const { user, logout, isLoggingOut } = useAuth();
  const location = useLocation();

  let links = studentLinks;
  if (type === "instructor") links = instructorLinks;
  if (type === "admin") links = adminLinks;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {(!collapsed || isMobile) && (
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">
              Nexus<span className="text-primary">Academy</span>
            </span>
          </Link>
        )}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-small font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${(collapsed && !isMobile) ? "justify-center" : ""}`}
              title={(collapsed && !isMobile) ? link.label : undefined}
            >
              <link.icon size={20} />
              {(!collapsed || isMobile) && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-border space-y-1">
        {user && (!collapsed || isMobile) && (
          <div className="px-3 py-2 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
              {user.avatar_url ? (
                <img src={getMediaUrl(user.avatar_url)} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                `${user.first_name[0]}${user.last_name[0]}`
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate">{user.first_name} {user.last_name}</span>
              <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-small font-medium text-[#F24848] hover:text-destructive hover:bg-destructive/10 transition-colors w-full disabled:opacity-50 ${(collapsed && !isMobile) ? "justify-center" : ""}`}
          title={(collapsed && !isMobile) ? "Log Out" : undefined}
        >
          {isLoggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
          {(!collapsed || isMobile) && <span>{isLoggingOut ? " Logging Out..." : " Log Out"}</span>}
        </button>
      </div>
    </div>
  );
};

const DashboardSidebar = ({ type }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-border transition-all duration-300 h-screen sticky top-0 overflow-hidden ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <SidebarContent 
        type={type} 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
    </aside>
  );
};

export default DashboardSidebar;
