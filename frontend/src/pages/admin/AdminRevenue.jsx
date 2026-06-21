import { DollarSign, TrendingUp, Wallet, ShoppingBag, Crown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminStats, monthlySalesData } from '@/data/vendorData';
import { useToast } from '@/hooks/use-toast';

const stats = [
  { label: 'Gross Revenue', value: `₦${(adminStats.totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-green-600' },
  { label: 'Commission Earned', value: `₦${(adminStats.commissionEarned / 1000000).toFixed(2)}M`, icon: TrendingUp, color: 'text-primary' },
  { label: 'Premium Subs', value: '₦480K', icon: Crown, color: 'text-yellow-500' },
  { label: 'Net Payout to Vendors', value: '₦11.25M', icon: Wallet, color: 'text-blue-500' },
];

const breakdown = [
  { source: 'Commission on Sales', amount: 1250000, pct: 72 },
  { source: 'Premium Subscriptions', amount: 480000, pct: 18 },
  { source: 'Featured Listings', amount: 195000, pct: 7 },
  { source: 'Promoted Stores', amount: 75000, pct: 3 },
];

const AdminRevenue = () => {
  const { toast } = useToast();
  const max = Math.max(...monthlySalesData.map(m => m.sales));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Platform Revenue</h1>
        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Report exported', description: 'Revenue report downloaded as CSV.' })}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlySalesData.map(m => (
                <div key={m.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.month}</span>
                    <span className="font-medium text-foreground">₦{(m.sales / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(m.sales / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-base">Revenue Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breakdown.map(b => (
                <div key={b.source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{b.source}</span>
                    <span className="font-medium">₦{b.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Top Earning Vendors</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Glow Beauty', revenue: 4250000, commission: 425000 },
              { name: 'Ama Collections', revenue: 3850000, commission: 385000 },
              { name: 'Kings Tailoring', revenue: 2150000, commission: 215000 },
              { name: 'Luxe Accessories NG', revenue: 985000, commission: 98500 },
            ].map(v => (
              <div key={v.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="font-medium text-foreground">{v.name}</p>
                <div className="text-right">
                  <p className="text-sm font-medium">₦{v.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Commission: ₦{v.commission.toLocaleString()}</p>
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
