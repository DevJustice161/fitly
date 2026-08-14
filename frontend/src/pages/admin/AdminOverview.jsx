import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Store,
  DollarSign,
  Wallet,
  Package,
  Clock,
  ShoppingBag,
  Crown,
  BadgeCheck,
  TrendingUp,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Star,
  Bell,
  FolderTree,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Receipt,
  PackageSearch,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import StatisticCard from "@/components/admin/StatisticCard";
import SectionHeader from "@/components/admin/SectionHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { adminDashboardMock } from "@/data/adminDashboardData";
import {
  adminStats,
  vendorApplications,
  adminWithdrawalRequests,
} from "@/data/vendorData";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const capitalizeWord = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const capitalizeSentence = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const num = (v) => Number(v || 0).toLocaleString();
const initials = (s) =>
  String(s || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const formatDate = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const quickActions = [
  {
    label: "Approve Applications",
    icon: BadgeCheck,
    to: "/admin/applications",
  },
  { label: "Manage Vendors", icon: Store, to: "/admin/vendors" },
  { label: "Manage Products", icon: Package, to: "/admin/products" },
  { label: "Manage Orders", icon: ShoppingBag, to: "/admin/orders" },
  { label: "Manage Categories", icon: FolderTree, to: "/admin/categories" },
  { label: "Manage Couriers", icon: Truck, to: "/admin/couriers" },
  { label: "Manage Withdrawals", icon: Wallet, to: "/admin/withdrawals" },
  { label: "View Reports", icon: BarChart3, to: "/admin/revenue" },
];

const notificationIcons = {
  application: Store,
  withdrawal: Wallet,
  order: ShoppingBag,
  review: Star,
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <Skeleton className="h-32 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);

const AdminOverview = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const naira = (v) => `${currencySymbol}${Number(v || 0).toLocaleString()}`;
  const compactNaira = (v) => {
    const n = Number(v || 0);
    if (n >= 1_000_000)
      return `${currencySymbol}${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${currencySymbol}${(n / 1_000).toFixed(0)}K`;
    return `${currencySymbol}${n}`;
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = await res.json();
      setData(json?.data || json);
    } catch (err) {
      console.log(err);
      setData(adminDashboardMock);
      setError("Could not reach the dashboard service");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleApplicationAction = async (app, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `${API_URL}/vendors/approve/${app.id}`
          : `${API_URL}/vendors/reject/${app.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed");
      }

      setData((prev) => ({
        ...prev,
        recentApplications: prev.recentApplications.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: action === "approve" ? "Approved" : "Rejected",
              }
            : a,
        ),
      }));

      toast({
        title:
          action === "approve"
            ? "Application approved"
            : "Application rejected",
        description: data.message,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawalAction = async (w, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `${API_URL}/withdrawals/approve/${w.id}`
          : `${API_URL}/withdrawals/reject/${w.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed");
      }

      setData((prev) => ({
        ...prev,
        recentWithdrawals: prev.recentWithdrawals.filter(
          (item) => item.id !== w.id,
        ),
      }));

      toast({
        title:
          action === "approve" ? "Withdrawal approved" : "Withdrawal rejected",
        description: data.message,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const today = data?.today || {};
  const orderSummary = data?.orderSummary || {};
  const applications = data?.recentApplications || [];
  const withdrawals = data?.recentWithdrawals || [];
  const orders = data?.recentOrders || [];
  const topVendors = data?.topVendors || [];
  const topProducts = data?.topProducts || [];
  const notifications = data?.notifications || [];

  const statCards = [
    {
      label: "Total Revenue",
      value: compactNaira(stats.totalRevenue),
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "Platform Earnings",
      value: compactNaira(stats.platformEarnings),
      icon: TrendingUp,
      tone: "gold",
      hint: "Commission",
    },
    {
      label: "Total Orders",
      value: num(stats.totalOrders),
      icon: ShoppingBag,
      tone: "blue",
    },
    {
      label: "Total Products",
      value: num(stats.totalProducts),
      icon: Package,
      tone: "purple",
    },
    {
      label: "Total Customers",
      value: num(stats.totalCustomers),
      icon: Users,
      tone: "pink",
    },
    {
      label: "Total Vendors",
      value: num(stats.totalVendors),
      icon: Store,
      tone: "gold",
    },
    {
      label: "Premium Vendors",
      value: num(stats.premiumVendors),
      icon: Crown,
      tone: "gold",
    },
    {
      label: "Pending Applications",
      value: num(stats.pendingApplications),
      icon: Clock,
      tone: "orange",
    },
    {
      label: "Pending Withdrawals",
      value: num(stats.pendingWithdrawals),
      icon: Wallet,
      tone: "red",
    },
  ];

  const orderSummaryCards = [
    {
      label: "Processing",
      value: num(orderSummary.processing),
      icon: Loader2,
      tone: "blue",
    },
    {
      label: "Shipped",
      value: num(orderSummary.shipped),
      icon: Truck,
      tone: "purple",
    },
    {
      label: "Delivered",
      value: num(orderSummary.delivered),
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Cancelled",
      value: num(orderSummary.cancelled),
      icon: XCircle,
      tone: "red",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* 1. Hero */}
      <section className="bg-gradient-to-r from-secondary via-cream to-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-foreground/80 mt-1">
              Welcome back, {user?.name}. Here's how Fitly is performing today.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" • "}Platform-wide overview of revenue, vendors, orders and
              payouts.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboard}
            className="self-start shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-destructive">
              Live data unavailable
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {error}. Showing the latest cached snapshot.
            </p>
          </div>
        </div>
      )}

      {/* 2. Statistics */}
      <section>
        <SectionHeader
          title="Platform Statistics"
          subtitle="Key numbers across the marketplace"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <StatisticCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* 3 & 4. Today + Order summary */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Order Summary" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {orderSummaryCards.map((c) => (
              <StatisticCard key={c.label} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* 5 & 6. Applications + Withdrawals */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader
            title="Recent Vendor Applications"
            viewAllTo="/admin/applications"
          />
          {applications.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No applications"
              description="New vendor applications will appear here."
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card
                  key={app.id}
                  className="border border-border shadow-soft rounded-2xl transition-shadow hover:shadow-card"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage
                          src={`${BACKEND_URL}/uploads/logos/${app.logo}`}
                          alt={`${app.storeName} logo`}
                        />
                        <AvatarFallback className="bg-secondary text-xs font-heading">
                          {initials(app.storeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {app.storeName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.owner} • {formatDate(app.appliedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={app.status} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => navigate("/admin/applications")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      {["Pending", "Under Review"].includes(app.status) && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              handleApplicationAction(app, "approve")
                            }
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-destructive"
                            onClick={() =>
                              handleApplicationAction(app, "reject")
                            }
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title="Pending Withdrawals"
            viewAllTo="/admin/withdrawals"
          />
          {withdrawals.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No withdrawal requests"
              description="Vendor payout requests will show up here."
            />
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <Card
                  key={w.id}
                  className="border border-border shadow-soft rounded-2xl transition-shadow hover:shadow-card"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {w.vendor}
                      </p>
                      <p className="font-heading font-bold text-foreground">
                        {naira(w.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {w.bank} • {formatDate(w.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={capitalizeWord(w.status)} />
                      {w.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleWithdrawalAction(w, "approve")}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-destructive"
                            onClick={() => handleWithdrawalAction(w, "reject")}
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Recent Orders */}
      <section>
        <SectionHeader title="Recent Orders" viewAllTo="/admin/orders" />
        {orders.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No orders yet"
            description="Orders placed on the marketplace will appear here."
          />
        ) : (
          <Card className="border border-border shadow-soft rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-secondary/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-border transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.customer}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.vendor}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.productName}
                      </td>
                      <td className="px-4 py-3 font-heading font-semibold text-foreground">
                        {naira(o.total)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={capitalizeWord(o.status)} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(o.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* 8 & 9. Top vendors + Top products */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Top Vendors" viewAllTo="/admin/vendors" />
          {topVendors.length === 0 ? (
            <EmptyState icon={Store} title="No vendor data" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topVendors.map((v) => (
                <Card
                  key={v.id}
                  className="border border-border shadow-soft rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage
                          src={`${BACKEND_URL}/uploads/logos/${v.logo}`}
                          alt={`${v.storeName} logo`}
                        />
                        <AvatarFallback className="bg-secondary text-xs font-heading">
                          {initials(v.storeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {v.storeName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-gold text-gold" />{" "}
                          {v.rating}
                        </p>
                      </div>
                      {v.premium == 1 && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark font-medium flex items-center gap-1">
                          <Crown className="h-3 w-3" /> Premium
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Sales{" "}
                        <span className="font-heading font-semibold text-foreground">
                          {compactNaira(v.totalSales)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Orders{" "}
                        <span className="font-heading font-semibold text-foreground">
                          {num(v.totalOrders)}
                        </span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader title="Top Selling Products" />
          {topProducts.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No product sales yet" />
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <Card
                  key={p.id}
                  className="border border-border shadow-soft rounded-2xl transition-shadow hover:shadow-card"
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-secondary/60 overflow-hidden flex items-center justify-center shrink-0">
                      {p.image ? (
                        <img
                          src={`${BACKEND_URL}/uploads/products/${p.image}`}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.vendor}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-heading font-semibold text-foreground text-sm">
                        {compactNaira(p.revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {num(p.unitsSold)} sold
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 10 & 11. Quick actions + Notifications */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Quick Actions"
            subtitle="Jump straight into daily admin tasks"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/40"
              >
                <span className="h-9 w-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center transition-colors group-hover:bg-gold/25">
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium text-foreground leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            title="Notifications"
            viewAllTo="/admin/notifications"
          />
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="New platform alerts will land here."
            />
          ) : (
            <Card className="border border-border shadow-soft rounded-2xl">
              <CardContent className="p-2">
                {notifications.map((n) => {
                  const Icon = notificationIcons[n.type] || FileText;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-accent/40"
                    >
                      <span className="h-8 w-8 rounded-lg bg-secondary/70 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {n.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;
