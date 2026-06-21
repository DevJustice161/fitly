import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vendorStats, monthlySalesData, topSellingProducts } from '@/data/vendorData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(43, 72%, 52%)', 'hsl(345, 60%, 88%)', 'hsl(200, 60%, 50%)', 'hsl(140, 50%, 50%)'];

const VendorAnalytics = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: vendorStats.totalProducts },
          { label: 'Total Orders', value: vendorStats.totalOrders },
          { label: 'Conversion Rate', value: '3.8%' },
          { label: 'Avg Order Value', value: `₦${Math.round(vendorStats.totalSales / vendorStats.totalOrders).toLocaleString()}` },
        ].map(stat => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-lg">Monthly Sales</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySalesData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="hsl(43, 72%, 52%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-lg">Sales by Product</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={topSellingProducts} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                  {topSellingProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Units Sold']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalytics;
