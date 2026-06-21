import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, Wallet, TrendingUp, ArrowRight, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vendorStats, vendorOrders, monthlySalesData, topSellingProducts } from '@/data/vendorData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statCards = [
  { label: 'Total Products', value: vendorStats.totalProducts, icon: Package, color: 'text-primary' },
  { label: 'Total Orders', value: vendorStats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
  { label: 'Total Sales', value: `₦${(vendorStats.totalSales / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-green-600' },
  { label: 'Pending Withdrawal', value: `₦${vendorStats.pendingWithdrawals.toLocaleString()}`, icon: Wallet, color: 'text-orange-500' },
];

const VendorDashboardOverview = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-gradient-to-r from-secondary to-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Vendor Dashboard</h1>
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Manage your store, products, and orders</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
            <Link to="/vendor/products/add"><Package className="h-4 w-4 mr-2" /> Add Product</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-primary text-primary hover:bg-secondary">
            <Link to="/vendor/orders"><ShoppingBag className="h-4 w-4 mr-2" /> View Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Monthly Sales
          </CardTitle>
        </CardHeader>
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

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {vendorOrders.slice(0, 3).map((order) => (
              <Card key={order.id} className="border border-border shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <img src={order.productImage} alt={order.product} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{order.product}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-sm text-foreground">₦{order.price.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Processing' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{order.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topSellingProducts.map((product, i) => (
              <Card key={product.name} className="border border-border shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                  </div>
                  <p className="font-heading font-semibold text-sm text-foreground">₦{product.revenue.toLocaleString()}</p>
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
