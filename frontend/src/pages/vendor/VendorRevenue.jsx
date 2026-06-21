import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vendorStats, monthlySalesData, vendorOrders } from '@/data/vendorData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const VendorRevenue = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">₦{vendorStats.totalEarnings.toLocaleString()}</p>
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
              <p className="text-xl font-heading font-bold text-foreground">₦{vendorStats.commissionDeducted.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Commission Deducted (10%)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">₦{vendorStats.netBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Available Balance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${v / 1000}k`} />
              <Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="sales" stroke="hsl(43, 72%, 52%)" strokeWidth={3} dot={{ fill: 'hsl(43, 72%, 52%)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendorOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm text-foreground">{order.product}</p>
                  <p className="text-xs text-muted-foreground">{order.date} • {order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">+₦{order.earning.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">-₦{order.commission.toLocaleString()} fee</p>
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
