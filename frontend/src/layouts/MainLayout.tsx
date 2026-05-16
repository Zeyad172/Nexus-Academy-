import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-y-auto overflow-x-hidden custom-scrollbar">
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
