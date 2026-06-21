import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MessageCircle,
  Ticket,
  Star,
  MapPin,
  CreditCard,
  Settings,
  Bell,
  Clock,
  LogOut,
  Crown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Wishlist", url: "/dashboard/wishlist", icon: Heart },
  { title: "Messages", url: "/dashboard/messages", icon: MessageCircle },
  //{ title: "Vouchers & Coupons", url: "/dashboard/vouchers", icon: Ticket },
  { title: "My Reviews", url: "/dashboard/reviews", icon: Star },
  //{ title: "Delivery Addresses", url: "/dashboard/addresses", icon: MapPin },
  //{ title: "Payment Methods", url: "/dashboard/payments", icon: CreditCard },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Account Settings", url: "/dashboard/settings", icon: Settings },
  //{ title: "Recently Viewed", url: "/dashboard/recently-viewed", icon: Clock },
];

const DashboardSidebar = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const { unreadCount } = useNotifications();

  const API_URL = "http://localhost:5000/api/users";
  if (user.role === "vendor") {
    const fetchVendorDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/vendor/${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vendor details");
        }
        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      }
    };

    fetchVendorDetails();
  }
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage
                src={`http://localhost:5000/uploads/avatars/${user.avatar}`}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-heading text-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
              {userDetails && userDetails.is_premium && (
                <Badge className="mt-1 bg-primary text-primary-foreground text-[10px] px-2 py-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8 border-2 border-primary">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="relative">{item.title}</span>
                      )}
                      {item.title == "Notifications" && unreadCount > 0 && (
                        <span className="absolute  bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => setOpenLogoutDialog(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenLogoutDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
};

export default DashboardSidebar;
