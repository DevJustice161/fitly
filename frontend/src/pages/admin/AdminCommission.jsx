import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { commissionSettings } from '@/data/vendorData';
import { useToast } from '@/hooks/use-toast';

const AdminCommission = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(commissionSettings);

  const handleSave = () => {
    toast({ title: 'Commission settings saved', description: 'Commission rates have been updated.' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Commission Settings</h1>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Default Rates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard Vendor Commission (%)</Label>
              <Input type="number" value={settings.defaultRate} onChange={(e) => setSettings(s => ({ ...s, defaultRate: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Premium Vendor Commission (%)</Label>
              <Input type="number" value={settings.premiumRate} onChange={(e) => setSettings(s => ({ ...s, premiumRate: Number(e.target.value) }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Category-specific Rates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {settings.categories.map((cat, i) => (
            <div key={cat.name} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{cat.name}</span>
              <div className="flex items-center gap-2">
                <Input type="number" className="w-20 text-center" value={cat.rate}
                  onChange={(e) => {
                    const newCats = [...settings.categories];
                    newCats[i] = { ...newCats[i], rate: Number(e.target.value) };
                    setSettings(s => ({ ...s, categories: newCats }));
                  }} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-foreground font-medium mb-1">Commission Example</p>
        <p className="text-xs text-muted-foreground">
          Product price: ₦10,000 → Platform commission ({settings.defaultRate}%): ₦{(10000 * settings.defaultRate / 100).toLocaleString()} → Vendor receives: ₦{(10000 - 10000 * settings.defaultRate / 100).toLocaleString()}
        </p>
      </div>

      <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        Save Commission Settings
      </Button>
    </div>
  );
};

export default AdminCommission;
