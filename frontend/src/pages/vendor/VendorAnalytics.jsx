import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const COLORS = [
  "hsl(43, 72%, 52%)",
  "hsl(345, 60%, 88%)",
  "hsl(200, 60%, 50%)",
  "hsl(140, 50%, 50%)",
];

const VendorAnalytics = () => {
  const { user, token } = useAuth();
  const { siteDetails, domain, brand, extension } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const formatPrice = (price) =>
    `${currencySymbol}${Number(price || 0).toLocaleString()}`;
  const [vendorDashboard, setVendorDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `${API_URL}/vendors/dashboard/${user.id}`,
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

  const topSellingProducts = vendorDashboard?.topSelling.map((data) => ({
    ...data,
    sales: parseInt(data.sales),
    revenue: parseFloat(data.revenue),
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
        Analytics
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: "Total Products",
            value: vendorDashboard?.stats.totalProducts || 0,
          },
          {
            label: "Total Orders",
            value: vendorDashboard?.stats.totalOrders || 0,
          },
          {
            label: "Conversion Rate",
            value: vendorDashboard?.conversionRate || "0%",
          },
          {
            label: "Avg Order Value",
            value: `${formatPrice(Math.round(vendorDashboard?.stats.totalSales / vendorDashboard?.stats.totalOrders))}`,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Monthly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySalesData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${formatPrice(v / 1000)}k`}
                />
                <Tooltip formatter={(v) => [`${formatPrice(v)}`, "Sales"]} />
                <Bar
                  dataKey="sales"
                  fill="hsl(43, 72%, 52%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Sales by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={topSellingProducts}
                  dataKey="sales"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {topSellingProducts?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, "Units Sold"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalytics;
