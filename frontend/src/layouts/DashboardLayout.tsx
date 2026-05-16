import { ReactNode, useState } from "react";
import DashboardSidebar, { SidebarContent } from "@/components/DashboardSidebar";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  type: "student" | "instructor" | "admin";
}

const DashboardLayout = ({ children, type }: DashboardLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-border px-4 flex items-center justify-between bg-card sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap size={16} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">
            Nexus<span className="text-primary">Academy</span>
          </span>
        </Link>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent 
              type={type} 
              isMobile={true} 
              onClose={() => setIsMobileOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <DashboardSidebar type={type} />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pb-10">
        <PageTransition>
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </PageTransition>
        <ScrollToTop />
      </main>
    </div>
  );
};

export default DashboardLayout;
