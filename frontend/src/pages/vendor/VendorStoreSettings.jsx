import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vendorProfile } from '@/data/vendorData';
import { useToast } from '@/hooks/use-toast';

const VendorStoreSettings = () => {
  const { toast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    toast({ title: 'Settings saved', description: 'Your store settings have been updated.' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Store Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-lg">Store Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload new logo</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Banner</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload new banner</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input defaultValue={vendorProfile.storeName} />
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Textarea defaultValue={vendorProfile.storeDescription} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue={vendorProfile.category}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Women's fashion", "Men's fashion", "Shoes", "Bags", "Accessories", "Beauty products"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-lg">Contact & Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={vendorProfile.email} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input defaultValue={vendorProfile.phone} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input defaultValue={vendorProfile.address} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>City</Label><Input defaultValue={vendorProfile.city} /></div>
              <div className="space-y-2"><Label>State</Label><Input defaultValue={vendorProfile.state} /></div>
              <div className="space-y-2"><Label>Country</Label><Input defaultValue={vendorProfile.country} disabled /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="font-heading text-lg">Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Bank Name</Label><Input defaultValue={vendorProfile.bankName} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Account Name</Label><Input defaultValue={vendorProfile.accountName} /></div>
              <div className="space-y-2"><Label>Account Number</Label><Input defaultValue={vendorProfile.accountNumber} /></div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default VendorStoreSettings;
