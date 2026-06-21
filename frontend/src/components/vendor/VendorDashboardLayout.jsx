import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import VendorDashboardSidebar from "./VendorDashboardSidebar";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";

const VendorDashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VendorDashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link
                to="/"
                className="font-heading text-xl font-bold text-primary"
              >
                Fitly.ng
              </Link>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Vendor
              </span>
            </div>
            <Link
              to="/vendor/settings"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Store className="h-5 w-5" />
              <span className="hidden sm:inline">Business Settings</span>
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

export default VendorDashboardLayout;
