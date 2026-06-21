import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminDashboardSidebar from './AdminDashboardSidebar';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminDashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminDashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="font-heading text-xl font-bold text-primary">Fitly.ng</Link>
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" /> Admin
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
