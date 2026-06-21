import { useState } from 'react';
import { Save, Shield, Bell, Globe, Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [platform, setPlatform] = useState({
    name: 'Fitly.ng',
    supportEmail: 'support@fitly.ng',
    description: 'Nigeria\'s premier fashion marketplace.',
    currency: 'NGN',
    minWithdrawal: 5000,
  });
  const [notifications, setNotifications] = useState({
    newApplications: true,
    withdrawalRequests: true,
    weeklyReport: true,
    securityAlerts: true,
    marketingEmails: false,
  });
  const [security, setSecurity] = useState({
    twoFactor: true,
    requireEmailVerification: true,
    autoApproveVendors: false,
  });

  const save = (section) => {
    toast({ title: 'Settings saved', description: `${section} settings have been updated.` });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Platform Settings</h1>

      {/* Platform */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Platform</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Platform Name</Label>
              <Input value={platform.name} onChange={(e) => setPlatform({ ...platform, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input value={platform.supportEmail} onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={platform.currency} onChange={(e) => setPlatform({ ...platform, currency: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Min. Withdrawal (₦)</Label>
              <Input type="number" value={platform.minWithdrawal} onChange={(e) => setPlatform({ ...platform, minWithdrawal: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={platform.description} onChange={(e) => setPlatform({ ...platform, description: e.target.value })} rows={3} />
          </div>
          <Button onClick={() => save('Platform')} className="bg-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
          <CardDescription>Choose what to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'newApplications', label: 'New Vendor Applications', desc: 'Get notified when a vendor applies' },
            { key: 'withdrawalRequests', label: 'Withdrawal Requests', desc: 'Alerts on new withdrawal requests' },
            { key: 'weeklyReport', label: 'Weekly Revenue Report', desc: 'Receive a summary every Monday' },
            { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and unusual activity' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips and product updates' },
          ].map((opt, i) => (
            <div key={opt.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch checked={notifications[opt.key]} onCheckedChange={(v) => setNotifications({ ...notifications, [opt.key]: v })} />
              </div>
              {i < 4 && <Separator className="mt-4" />}
            </div>
          ))}
          <Button onClick={() => save('Notification')} className="bg-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" /> Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle>
          <CardDescription>Manage account and platform security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA on admin accounts' },
            { key: 'requireEmailVerification', label: 'Require Email Verification', desc: 'New vendors must verify their email' },
            { key: 'autoApproveVendors', label: 'Auto-Approve Vendors', desc: 'Skip manual review for trusted categories' },
          ].map((opt, i) => (
            <div key={opt.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch checked={security[opt.key]} onCheckedChange={(v) => setSecurity({ ...security, [opt.key]: v })} />
              </div>
              {i < 2 && <Separator className="mt-4" />}
            </div>
          ))}
          <Separator />
          <Button variant="outline" onClick={() => toast({ title: 'Password reset email sent' })}>
            <Lock className="h-4 w-4 mr-2" /> Change Admin Password
          </Button>
          <Button onClick={() => save('Security')} className="bg-primary text-primary-foreground ml-2">
            <Save className="h-4 w-4 mr-2" /> Save Security
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
