import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { vendorCustomers } from '@/data/vendorData';
import { useState } from 'react';

const VendorCustomers = () => {
  const [search, setSearch] = useState('');
  const filtered = vendorCustomers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Customers</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Orders</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Spent</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(customer => (
              <tr key={customer.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-medium text-foreground">{customer.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{customer.email}</td>
                <td className="py-3 px-4 text-center">{customer.orders}</td>
                <td className="py-3 px-4 text-right font-semibold">₦{customer.totalSpent.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">{customer.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorCustomers;
