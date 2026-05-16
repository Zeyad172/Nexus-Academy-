import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, GraduationCap, LogOut, LayoutDashboard, Settings, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getMediaUrl } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout, isLoggingOut, isLoading } = useAuth();
    const location = useLocation();

    const navLinks = [
        { label: "Explore", path: "/courses" },
        ...(user?.role === "instructor"  ? [{ label: "Teach", path: "/instructor" }] : []) ,
        ...(user?.role === "admin" ? [{ label: "Manage", path: "/admin" }] : [])
    ];

    const getDashboardPath = () => {
        if (!user) return "/dashboard";
        if (user.role === "admin") return "/admin";
        if (user.role === "instructor") return "/instructor";
        return "/dashboard";
    };

    return (
        <nav className="w-full bg-background border-b border-border sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Logo & Links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Nexus<span className="text-primary">Academy</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Center: Search (Desktop) */}
                <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-md border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Right: Auth & Actions */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse hidden md:block" />
                    ) : user ? (
                        <div className="hidden md:flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors outline-none group">
                                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={getMediaUrl(user.avatar_url)} alt={user.first_name} className="w-full h-full object-cover" />
                                            ) : (
                                                `${user.first_name[0]}${user.last_name[0]}`
                                            )}
                                        </div>
                                        <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-transform group-data-[state=open]:rotate-180" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold">{user.first_name} {user.last_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to={getDashboardPath()} className="flex items-center gap-2 w-full cursor-pointer">
                                            <LayoutDashboard size={16} />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard/settings" className="flex items-center gap-2 w-full cursor-pointer">
                                            <Settings size={16} />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-white cursor-pointer flex items-center gap-2"
                                        onClick={() => logout()}
                                        disabled={isLoggingOut}
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm" className="gradient-primary border-0 text-white">Join Now</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-md outline-none"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    location.pathname === link.path ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/dashboard/settings"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                                >
                                    Settings
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileOpen(false);
                                    }}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                        {!user && !isLoading && (
                            <Link to="/login" onClick={() => setMobileOpen(false)}>
                                <Button variant="outline" className="w-full justify-start h-10 px-3">Log In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
