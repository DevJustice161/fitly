import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  Heart,
  Ticket,
  ArrowRight,
  Package,
  TrendingUp,
  Store,
  Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  mockUser,
  mockStats,
  mockOrders,
  mockRecentlyViewed,
} from "@/data/dashboardData";

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: 0,
  });

  const [orders, setOrders] = useState([]);

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [loading, setLoading] = useState(true);

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-primary",
    },

    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-orange-500",
    },

    {
      label: "Wishlist Items",
      value: stats.wishlistItems,
      icon: Heart,
      color: "text-pink-500",
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/dashboard/${user.id}`,
        );

        const data = await response.json();

        setStats(data.stats);

        setOrders(data.recentOrders);

        setRecentlyViewed(data.recentlyViewed);

        console.log("Dashboard data:", orders, recentlyViewed);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboard();
    }
  }, [user?.id]);

  const statusNameChange = (status) => {
    const map = {
      pending_payment: "Pending",
      paid: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed: "Failed",
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">Loading dashboard...</div>
    );
  }
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-secondary to-card rounded-2xl p-6 md:p-8 shadow-sm border border-border mb-10">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your account today.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Link to="/">
              <ShoppingBag className="h-4 w-4 mr-2" /> Continue Shopping
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-secondary"
          >
            <Link to="/dashboard/orders">
              <Package className="h-4 w-4 mr-2" /> View Orders
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-secondary"
          >
            <Link to="/dashboard/wishlist">
              <Heart className="h-4 w-4 mr-2" /> View Wishlist
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recent Orders
          </h2>
          <Link
            to="/dashboard/orders"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              to={`/dashboard/orders/${order.order_id}`}
              key={order.order_id}
              className="block"
            >
              <Card
                key={order.order_item_id}
                className="border border-border shadow-sm"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={`http://localhost:5000/uploads/products/${order.thumbnail}`}
                    alt={order.product_name}
                    className="h-14 w-14 rounded-lg object-cover bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {order.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_id} •{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-foreground">
                      ₦{Number(order.total).toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        statusNameChange(order.status) === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : statusNameChange(order.status) === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : statusNameChange(order.status) === "Pending"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusNameChange(order.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Recently Viewed
          </h2>
          <Link
            to="/dashboard/recently-viewed"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockRecentlyViewed.map((item) => (
            <Card
              key={item.id}
              className="border border-border shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <CardContent className="p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-square rounded-lg object-cover bg-muted mb-2"
                />
                <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.vendor}</p>
                <p className="font-heading font-semibold text-sm text-foreground mt-1">
                  ₦{Number(item.price).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Become a Vendor */}
      <Card className="border border-primary/30 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/30 mt-10">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Start Selling on Fitly.ng
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Turn your fashion business into a thriving online store. Join
              hundreds of vendors already earning on our platform.
            </p>
          </div>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full whitespace-nowrap"
          >
            <Link to={user.role === "vendor" ? "/dashboard" : "/vendor/apply"}>
              <Crown className="h-4 w-4 mr-2" />{" "}
              {user.role === "vendor" ? "Vendor Dashboard" : "Become a Vendor"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
