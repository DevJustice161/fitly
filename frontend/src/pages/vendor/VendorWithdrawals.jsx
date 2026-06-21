import { useState } from 'react';
import { Wallet, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vendorStats, vendorWithdrawals, vendorProfile } from '@/data/vendorData';
import { useToast } from '@/hooks/use-toast';

const VendorWithdrawals = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');

  const handleWithdraw = (e) => {
    e.preventDefault();
    toast({ title: 'Withdrawal Requested', description: `₦${Number(amount).toLocaleString()} withdrawal request submitted.` });
    setAmount('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Withdraw Funds</h1>

      <Card className="border border-border shadow-sm bg-gradient-to-r from-secondary to-card">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="text-3xl font-heading font-bold text-foreground">₦{vendorStats.netBalance.toLocaleString()}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">Total Earned: <span className="text-foreground font-medium">₦{vendorStats.totalEarnings.toLocaleString()}</span></span>
            <span className="text-muted-foreground">Commission: <span className="text-destructive font-medium">₦{vendorStats.commissionDeducted.toLocaleString()}</span></span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Request Withdrawal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label>Withdrawal Amount (₦)</Label>
              <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium text-foreground mb-1">Payment Details</p>
              <p className="text-muted-foreground">{vendorProfile.bankName} • {vendorProfile.accountName} • ****{vendorProfile.accountNumber.slice(-4)}</p>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!amount || Number(amount) <= 0}>
              <ArrowDownCircle className="h-4 w-4 mr-2" /> Request Withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Withdrawal History</h2>
        <div className="space-y-3">
          {vendorWithdrawals.map(w => (
            <Card key={w.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {w.status === 'Approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-heading font-semibold text-foreground">₦{w.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{w.date} • {w.bank}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  w.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{w.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorWithdrawals;
