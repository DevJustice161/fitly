import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Crown,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AdminRevenue = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const naira = (v) => `${currencySymbol}${Number(v || 0).toLocaleString()}`;
  const [adminStats, setAdminStats] = useState(null);
  const [monthlySalesData, setMonthlySalesData] = useState(null);
  const [reports, setReports] = useState({
    vendorPerformance: [],
    topProducts: [],
    topCategories: [],
    breakdown: [],
  });
  const { toast } = useToast();
  const API_URL = "http://localhost:5000/api";

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReports(data);
      setAdminStats(data.adminStats);
      setMonthlySalesData(data.monthlySalesData);
    } catch (error) {
      toast({
        title: "Error fetching Analytics",
        description: "Unable to load analytics. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = [
    {
      label: "Gross Revenue",
      value: `${currencySymbol}${adminStats?.totalRevenue / 1000}K`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Commission Earned",
      value: `${currencySymbol}${adminStats?.commissionEarned / 1000}K`,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Premium Subs",
      value: `${currencySymbol}${adminStats?.totalPremiumSubscriptions / 1000}K`,
      icon: Crown,
      color: "text-yellow-500",
    },
    {
      label: "Net Payout to Vendors",
      value: `${currencySymbol}${adminStats?.netPayoutToVendors / 1000}K`,
      icon: Wallet,
      color: "text-blue-500",
    },
  ];

  const GOLD = "hsl(43, 72%, 52%)";
  const PINK = "hsl(340, 60%, 78%)";
  const CREAM = "hsl(38, 90%, 70%)";
  const BLUE = "hsl(210, 70%, 60%)";
  const GREEN = "hsl(150, 55%, 45%)";

  const monthly = monthlySalesData?.map((m) => ({
    month: m.month,
    revenue: Number(m.sales),
    commission: Number(m.commission),
    orders: Number(m.orders),
  }));

  const vendorPerformance = reports?.vendorPerformance.map((vp) => ({
    vendor: vp.vendor,
    revenue: Number(vp.revenue),
    orders: Number(vp.orders),
  }));

  const topProducts = reports?.topProducts.map((tp) => ({
    name: tp.name,
    sold: Number(tp.sold),
    revenue: Number(tp.revenue),
  }));

  const topCategories = reports?.topCategories.map((tc) => ({
    name: tc.name,
    value: Number(tc.value),
  }));
  const PIE_COLORS = [GOLD, PINK, BLUE, GREEN, CREAM];

  const breakdown = reports?.breakdown.map((b) => ({
    source: b.source,
    amount: Number(b.amount),
    pct: Number(b.pct),
  }));

  const ChartCard = ({ title, children }) => (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-3">{children}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Platform Revenue
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Report exported",
              description: "Revenue report downloaded as CSV.",
            })
          }
        >
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
              />
              <Tooltip formatter={(v) => naira(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                fill="url(#revGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales vs Commission">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${currencySymbol}${v / 1000}k`}
              />
              <Tooltip formatter={(v) => naira(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="revenue"
                name="Sales"
                fill={PINK}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="commission"
                name="Commission"
                fill={GOLD}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke={BLUE}
                strokeWidth={3}
                dot={{ r: 4, fill: BLUE }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories (share of sales)">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={topCategories}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
              >
                {topCategories.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vendor Performance">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={vendorPerformance}
              layout="vertical"
              margin={{ left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `₦${v / 1000000}M`}
              />
              <YAxis
                type="category"
                dataKey="vendor"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip formatter={(v) => naira(v)} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill={GOLD}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Selling Products">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                formatter={(v, n) => (n === "Units Sold" ? v : naira(v))}
              />
              <Bar
                dataKey="sold"
                name="Units Sold"
                fill={PINK}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{b.source}</span>
                  <span className="font-medium">{naira(b.amount)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Top Earning Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendorPerformance.map((v) => (
              <div
                key={v.vendor}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{v.vendor}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.orders} {v.orders <= 1 ? "order" : "orders"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{naira(v.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Commission: {naira(Math.round(v.revenue * 0.1))}
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

export default AdminRevenue;
