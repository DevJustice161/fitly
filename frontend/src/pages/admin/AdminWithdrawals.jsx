import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminWithdrawalRequests } from '@/data/vendorData';
import { useToast } from '@/hooks/use-toast';

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState(adminWithdrawalRequests);

  const updateStatus = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: `Withdrawal ${status}`, description: `Withdrawal request has been ${status.toLowerCase()}.` });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Withdrawal Requests</h1>

      <div className="space-y-3">
        {requests.map(w => (
          <Card key={w.id} className="border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{w.vendor}</p>
                <p className="text-lg font-heading font-bold text-foreground">₦{w.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{w.date} • {w.bank} • {w.accountNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  w.status === 'Approved' ? 'bg-green-100 text-green-700' : w.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{w.status}</span>
                {w.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(w.id, 'Approved')}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => updateStatus(w.id, 'Rejected')}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
