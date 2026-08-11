import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  DollarSign,
  BarChart3,
  Wallet,
  Settings,
  Crown,
  MessageCircle,
  Bell,
  LogOut,
  BadgeCheck,
  Star,
  Ticket,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMessages } from "@/contexts/MessagesContext";

const menuItems = [
  { title: "Dashboard", url: "/vendor", icon: LayoutDashboard },
  { title: "My Products", url: "/vendor/products", icon: Package },
  { title: "Add Product", url: "/vendor/products/add", icon: PlusCircle },
  { title: "Orders", url: "/vendor/orders", icon: ShoppingBag },
  { title: "Customers", url: "/vendor/customers", icon: Users },
  { title: "Revenue", url: "/vendor/revenue", icon: DollarSign },
  { title: "Analytics", url: "/vendor/analytics", icon: BarChart3 },
  { title: "Withdraw Funds", url: "/vendor/withdrawals", icon: Wallet },
  { title: "Store Settings", url: "/vendor/settings", icon: Settings },
  { title: "Premium", url: "/vendor/premium", icon: Crown },
  { title: "Messages", url: "/vendor/messages", icon: MessageCircle },
  { title: "Reviews", url: "/vendor/reviews", icon: Star },
  { title: "Vouchers", url: "/vendor/vouchers", icon: Ticket },
  { title: "Notifications", url: "/vendor/notifications", icon: Bell },
];

const VendorDashboardSidebar = () => {
  const { unreadCount } = useNotifications();
  const { unreadMsgCount } = useMessages();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const API_URL = "http://localhost:5000/api";
  const { state } = useSidebar();
  const [vendorProfile, setVendorProfile] = useState({});
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const fetchVendorProfile = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}/vendors/profile/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVendorProfile(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, [user?.id]);

  useEffect(() => {
    const handleVendorProfileUpdate = () => {
      fetchVendorProfile();
    };

    window.addEventListener(
      "vendor-profile-updated",
      handleVendorProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        "vendor-profile-updated",
        handleVendorProfileUpdate,
      );
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.store_logo || user?.avatar) {
      setVendorProfile((prev) => ({
        ...prev,
        store_logo: user.store_logo || user.avatar,
      }));
    }
  }, [user?.store_logo, user?.avatar]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <SEO
        title={`${vendorProfile?.store_name} — Fashion Store`}
        description={`Shop fashion from ${vendorProfile?.store_name} on Fitly.ng. Discover clothing, shoes, accessories and more.`}
        image={`http://localhost:5000/uploads/logos/${vendorProfile?.store_logo || user?.store_logo || user?.avatar || ""}`}
        url={`/vendors/${vendorProfile?.id}`}
        noIndex
      />
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage
                  src={`http://localhost:5000/uploads/logos/${vendorProfile.store_logo || user?.store_logo || user?.avatar || ""}`}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground font-heading text-lg">
                  {vendorProfile?.store_name
                    ? vendorProfile.store_name.split(" ")
                    : [].map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-heading font-semibold text-foreground truncate">
                    {vendorProfile.store_name}
                  </p>
                  {vendorProfile.is_verified === 1 && (
                    <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vendor since{" "}
                  {vendorProfile.created_at &&
                    new Date(vendorProfile.created_at).toLocaleDateString(
                      "en-NG",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                </p>
                {vendorProfile.is_premium === 1 && (
                  <Badge className="mt-1 bg-primary text-primary-foreground text-[10px] px-2 py-0">
                    <Crown className="h-3 w-3 mr-1" /> Premium Vendor
                  </Badge>
                )}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {vendorProfile.store_name
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
                        end={item.url === "/vendor"}
                        className="hover:bg-accent/50 transition-colors"
                        activeClassName="bg-accent text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.title == "Notifications" && unreadCount > 0 && (
                          <span className="absolute  bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                        {item.title == "Messages" && unreadMsgCount > 0 && (
                          <span className="absolute  bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadMsgCount}
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
                tooltip="Back to Shopping"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                {!collapsed && <span>Back to Shop</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
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
    </>
  );
};

export default VendorDashboardSidebar;
