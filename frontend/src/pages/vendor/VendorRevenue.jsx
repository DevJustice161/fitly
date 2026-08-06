import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const VendorRevenue = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const [vendorDashboard, setVendorDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/vendors/dashboard/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  const statusNameChange = (status) => {
    const map = {
      pending_payment: "Pending",
      processing: "Processing",
      paid: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed: "Failed",
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
      <h1 className="font-heading text-2xl font-bold text-foreground mb-4">
        Revenue
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">
                {currencySymbol}
                {Number(
                  vendorDashboard?.commissionDetails.totalEarnings,
                ).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">
                {currencySymbol}
                {Number(
                  vendorDashboard?.commissionDetails.commissionDeducted,
                ).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Commission Deducted (
                {vendorDashboard?.commissionDetails.commissionPercentage})
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">
                {currencySymbol}
                {Number(
                  vendorDashboard?.commissionDetails.netBalance,
                ).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Available Balance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
              />
              <Tooltip
                formatter={(v) => [
                  `${currencySymbol}${v.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(43, 72%, 52%)"
                strokeWidth={3}
                dot={{ fill: "hsl(43, 72%, 52%)", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendorDashboard?.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {order.product}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {order.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">
                    +{currencySymbol}
                    {Number(order.price).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground text-red-700">
                    -{currencySymbol}
                    {Number(
                      order.price *
                        vendorDashboard.commissionDetails.commissionRate,
                    ).toLocaleString()}{" "}
                    fee
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorRevenue;
