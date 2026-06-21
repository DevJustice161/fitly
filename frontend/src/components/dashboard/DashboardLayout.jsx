import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="font-heading text-xl font-bold text-primary">
                Fitly.ng
              </Link>
            </div>
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
