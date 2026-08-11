import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Wallet,
  TrendingUp,
  ArrowRight,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const VendorDashboardOverview = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const formatCurrency = (value) =>
    `${currencySymbol}${Number(value || 0).toLocaleString()}`;
  const [vendorDashboard, setVendorDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/vendors/dashboard/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();

        setVendorDashboard(data);
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

  const statCards = [
    {
      label: "Total Products",
      value: vendorDashboard?.stats.totalProducts,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Total Orders",
      value: vendorDashboard?.stats.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-500",
    },
    {
      label: "Total Sales",
      value: `${currencySymbol}${Number((vendorDashboard?.stats.totalSales / 1000).toFixed(1))}K`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Pending Withdrawal",
      value: formatCurrency(vendorDashboard?.stats.totalPendingWithdrawals),
      icon: Wallet,
      color: "text-orange-500",
    },
  ];

  const statusNameChange = (status) => {
    const map = {
      pending_payment: "Pending",
      pending: "Pending",
      processing: "Processing",
      paid: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed: "Failed",
    };
    return map[status] || status;
  };

  const statusColorChange = (status) => {
    const map = {
      pending_payment: "bg-yellow-100 text-yellow-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800",
    };
    return map[status] || status;
  };

  const monthlySalesMap = (month) => {
    const map = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };
    return map[month] || month;
  };

  const monthlySalesData = vendorDashboard?.monthlySales.map((data) => ({
    ...data,
    month: monthlySalesMap(data.month),
    sales: parseFloat(data.sales),
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="mb-4 bg-gradient-to-r from-secondary to-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Vendor Dashboard
          </h1>
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Manage your store, products, and orders
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Link to="/vendor/products/add">
              <Package className="h-4 w-4 mr-2" /> Add Product
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-secondary"
          >
            <Link to="/vendor/orders">
              <ShoppingBag className="h-4 w-4 mr-2" /> View Orders
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                <p className="text-xl font-heading font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Monthly Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySalesData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
              />
              <Tooltip
                formatter={(v) => [
                  `${currencySymbol}${v.toLocaleString()}`,
                  "Sales",
                ]}
              />
              <Bar
                dataKey="sales"
                fill="hsl(43, 72%, 52%)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="mt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-500" size={20} />

          <h2 className="font-heading text-lg font-semibold">
            Low Stock Alerts
          </h2>
        </div>

        {vendorDashboard?.lowStockAlert.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Package className="mx-auto mb-3 text-primary" size={35} />

              <p className="font-medium">
                All products are sufficiently stocked
              </p>

              <p className="text-sm text-muted-foreground">
                No low-stock products.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {vendorDashboard?.lowStockAlert.map((product) => (
              <Card key={product.id} className="border-orange-200">
                <CardContent className="p-3 flex gap-3">
                  <img
                    src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                    className="w-14 h-14 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>

                    <p className="text-xs text-muted-foreground">
                      Remaining Stock:{" "}
                      <span className="text-orange-600 font-semibold">
                        {product.stock_quantity}
                      </span>
                    </p>
                  </div>

                  <Button size="sm" asChild>
                    <Link to={`/vendor/products`}>Restock</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">
              Recent Orders
            </h2>

            <Link
              to="/vendor/orders"
              className="text-primary flex items-center gap-1 text-sm"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-3">
            {vendorDashboard?.recentOrders.map((order) => (
              <Card
                key={order.order_item_id}
                className="hover:shadow-md transition-all cursor-pointer"
              >
                <CardContent className="p-3 flex gap-3">
                  <img
                    src={`http://localhost:5000/uploads/products/${order.thumbnail}`}
                    className="w-14 h-14 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{order.product}</p>

                        <p className="text-xs text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>

                      <Badge
                        className={`text-xs ${statusColorChange(order.status)}`}
                      >
                        {statusNameChange(order.status)}
                      </Badge>
                    </div>

                    <div className="flex justify-between mt-2 text-sm">
                      <span>Qty: {order.quantity}</span>

                      <span className="font-semibold">
                        {formatCurrency(order.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">
              Top Selling Products
            </h2>

            <Link
              to="/vendor/products"
              className="text-primary flex items-center gap-1 text-sm"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-3">
            {vendorDashboard?.topSelling.map((product, index) => (
              <Card key={product.id} className="hover:shadow-md transition-all">
                <CardContent className="p-3 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>

                  <img
                    src={`http://localhost:5000/uploads/products/${product.thumbnail}`}
                    className="w-14 h-14 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>

                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{product.sales} sold</span>

                      <span>Stock {product.stock_quantity}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(product.revenue)}
                    </p>

                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardOverview;
