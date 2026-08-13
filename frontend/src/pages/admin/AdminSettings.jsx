import { useState, useEffect } from "react";
import {
  Save,
  Shield,
  Bell,
  Globe,
  Lock,
  Truck,
  Receipt,
  Wrench,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const AdminSettings = () => {
  const { user, token } = useAuth();
  const { siteDetails, domain, brand, extension } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.BACKEND_URL;
  const [site, setSite] = useState({
    name: "Fitly.ng",
    logo: "/placeholder.svg",
    email: "support@fitly.ng",
    phone: "+234 801 234 5678",
    address: "14 Adeola Odeku Street, Victoria Island, Lagos",
    description: "Nigeria's premier fashion marketplace.",
    currency: "NGN",
    currencySymbol: "₦",
    minWithdrawal: 5000,
    news_tip: "Get the latest fashion tips and news from Fitly.ng.",
  });
  const [tax, setTax] = useState({
    vatEnabled: true,
    vatRate: 7.5,
    vatInclusive: false,
  });
  const [shipping, setShipping] = useState({
    baseFee: 2500,
    freeThreshold: 50000,
    interstateFee: 4500,
    estimatedDays: "2-5",
    freeShippingEnabled: true,
  });
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message:
      "Fitly.ng is undergoing scheduled maintenance. We will be back shortly.",
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

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  const fetchSettings = async () => {
    const res = await fetch(`${API_URL}/settings/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setSite({
      name: data.site_name,
      logo: data.site_logo,
      email: data.support_email,
      phone: data.support_phone,
      address: data.business_address,
      description: data.description,
      currency: data.currency,
      currencySymbol: data.currency_symbol,
      minWithdrawal: data.minimum_withdrawal,
      news_tip: data.news_tip || "",
    });

    setTax({
      vatEnabled: Boolean(data.vat_enabled),
      vatRate: Number(data.vat_rate),
      vatInclusive: Boolean(data.vat_inclusive),
    });

    setShipping({
      baseFee: Number(data.base_delivery_fee),
      interstateFee: Number(data.interstate_fee),
      freeThreshold: Number(data.free_shipping_threshold),
      estimatedDays: data.estimated_delivery_days,
      freeShippingEnabled: Boolean(data.free_shipping_enabled),
    });

    setMaintenance({
      enabled: Boolean(data.maintenance_mode),
      message: data.maintenance_message,
    });

    setNotifications({
      newApplications: Boolean(data.notify_vendor_applications),
      withdrawalRequests: Boolean(data.notify_withdrawals),
      weeklyReport: Boolean(data.notify_weekly_report),
      securityAlerts: Boolean(data.notify_security_alerts),
      marketingEmails: Boolean(data.notify_marketing_emails),
    });

    setSecurity({
      twoFactor: Boolean(data.two_factor),
      requireEmailVerification: Boolean(data.email_verification),
      autoApproveVendors: Boolean(data.auto_approve_vendors),
    });
  };
  useEffect(() => {
    fetchSettings();
  }, []);

  const save = async (section) => {
    try {
      let endpoint = "";
      let body = {};

      switch (section) {
        case "site":
          endpoint = "/settings/site";
          body = site;
          break;

        case "tax":
          endpoint = "/settings/tax";
          body = tax;
          break;

        case "shipping":
          endpoint = "/settings/shipping";
          body = shipping;
          break;

        case "maintenance":
          endpoint = "/settings/maintenance";
          body = maintenance;
          break;

        case "notification":
          endpoint = "/settings/notifications";
          body = notifications;
          break;

        case "security":
          endpoint = "/settings/security";
          body = security;
          break;

        default:
          return;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  const onLogoChange = async (e) => {
    try {
      const file = e.target.files?.[0];

      if (!file) return;

      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(`${API_URL}/settings/site/logo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSite((prev) => ({
        ...prev,
        logo: data.filename,
      }));

      toast({
        title: "Logo Updated",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  const changePassword = async () => {
    if (!pw.current)
      return toast({
        title: "Current password required",
        variant: "destructive",
      });

    if (pw.next.length < 8)
      return toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });

    if (!/[A-Z]/.test(pw.next) || !/[0-9]/.test(pw.next))
      return toast({
        title: "Weak password",
        description: "Include an uppercase letter and a number.",
        variant: "destructive",
      });

    if (pw.next !== pw.confirm)
      return toast({
        title: "Passwords do not match",
        variant: "destructive",
      });

    try {
      const response = await fetch(`${API_URL}/settings/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPw({
        current: "",
        next: "",
        confirm: "",
      });

      setPwOpen(false);

      toast({
        title: "Password Updated",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        System Settings
      </h1>

      {/* Site identity */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Site Information
          </CardTitle>
          <CardDescription>
            Name, logo and contact details shown across the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden">
              {site.logo ? (
                <img
                  src={`${BACKEND_URL}/uploads/site/${site.logo}`}
                  alt="Site logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Site Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="max-w-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input
                value={site.name}
                onChange={(e) => setSite({ ...site, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input
                type="email"
                value={site.email}
                onChange={(e) => setSite({ ...site, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                value={site.phone}
                onChange={(e) => setSite({ ...site, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min. Withdrawal ({currencySymbol})</Label>
              <Input
                type="number"
                value={site.minWithdrawal}
                onChange={(e) =>
                  setSite({ ...site, minWithdrawal: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={site.currency}
                onValueChange={(v) =>
                  setSite({
                    ...site,
                    currency: v,
                    currencySymbol:
                      v === "NGN"
                        ? "₦"
                        : v === "USD"
                          ? "$"
                          : v === "GBP"
                            ? "£"
                            : "€",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN — Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">GBP — Pound Sterling (£)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency Symbol</Label>
              <Input
                value={site.currencySymbol}
                onChange={(e) =>
                  setSite({ ...site, currencySymbol: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Business Address</Label>
            <Textarea
              value={site.address}
              onChange={(e) => setSite({ ...site, address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={site.description}
              onChange={(e) =>
                setSite({ ...site, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>News & Tips</Label>
            <Textarea
              value={site.news_tip}
              onChange={(e) => setSite({ ...site, news_tip: e.target.value })}
              rows={3}
            />
          </div>
          <Button
            onClick={() => save("site")}
            className="bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* VAT */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Tax & VAT
          </CardTitle>
          <CardDescription>
            Configure how VAT is applied to orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable VAT</p>
              <p className="text-xs text-muted-foreground">
                Apply VAT to all marketplace orders
              </p>
            </div>
            <Switch
              checked={tax.vatEnabled}
              onCheckedChange={(v) => setTax({ ...tax, vatEnabled: v })}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>VAT Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                disabled={!tax.vatEnabled}
                value={tax.vatRate}
                onChange={(e) =>
                  setTax({ ...tax, vatRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Prices include VAT</p>
                <p className="text-xs text-muted-foreground">
                  Show tax-inclusive prices
                </p>
              </div>
              <Switch
                disabled={!tax.vatEnabled}
                checked={tax.vatInclusive}
                onCheckedChange={(v) => setTax({ ...tax, vatInclusive: v })}
              />
            </div>
          </div>
          <Button
            onClick={() => save("tax")}
            className="bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" /> Save VAT Settings
          </Button>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Truck className="h-4 w-4" /> Shipping
          </CardTitle>
          <CardDescription>
            Delivery fees and free shipping rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Base Delivery Fee ({currencySymbol})</Label>
              <Input
                type="number"
                value={shipping.baseFee}
                onChange={(e) =>
                  setShipping({ ...shipping, baseFee: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interstate Fee ({currencySymbol})</Label>
              <Input
                type="number"
                value={shipping.interstateFee}
                onChange={(e) =>
                  setShipping({
                    ...shipping,
                    interstateFee: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Free Shipping Threshold ({currencySymbol})</Label>
              <Input
                type="number"
                disabled={!shipping.freeShippingEnabled}
                value={shipping.freeThreshold}
                onChange={(e) =>
                  setShipping({
                    ...shipping,
                    freeThreshold: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Delivery (days)</Label>
              <Input
                value={shipping.estimatedDays}
                onChange={(e) =>
                  setShipping({ ...shipping, estimatedDays: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Free Shipping</p>
              <p className="text-xs text-muted-foreground">
                Waive delivery fees above the threshold
              </p>
            </div>
            <Switch
              checked={shipping.freeShippingEnabled}
              onCheckedChange={(v) =>
                setShipping({ ...shipping, freeShippingEnabled: v })
              }
            />
          </div>
          <Button
            onClick={() => save("shipping")}
            className="bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" /> Save Shipping
          </Button>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Maintenance Mode
            {maintenance.enabled && (
              <Badge variant="destructive" className="ml-1">
                Live
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Temporarily take the storefront offline for visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">
                Only admins can access the site while enabled
              </p>
            </div>
            <Switch
              checked={maintenance.enabled}
              onCheckedChange={(v) =>
                setMaintenance({ ...maintenance, enabled: v })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Maintenance Message</Label>
            <Textarea
              rows={3}
              value={maintenance.message}
              onChange={(e) =>
                setMaintenance({ ...maintenance, message: e.target.value })
              }
            />
          </div>
          <Button
            onClick={() => save("maintenance")}
            className="bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" /> Save Maintenance
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
          <CardDescription>Choose what to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "newApplications",
              label: "New Vendor Applications",
              desc: "Get notified when a vendor applies",
            },
            {
              key: "withdrawalRequests",
              label: "Withdrawal Requests",
              desc: "Alerts on new withdrawal requests",
            },
            {
              key: "weeklyReport",
              label: "Weekly Revenue Report",
              desc: "Receive a summary every Monday",
            },
            {
              key: "securityAlerts",
              label: "Security Alerts",
              desc: "Login attempts and unusual activity",
            },
            {
              key: "marketingEmails",
              label: "Marketing Emails",
              desc: "Tips and product updates",
            },
          ].map((opt, i) => (
            <div key={opt.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch
                  checked={notifications[opt.key]}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, [opt.key]: v })
                  }
                />
              </div>
              {i < 4 && <Separator className="mt-4" />}
            </div>
          ))}
          <Button
            onClick={() => save("notification")}
            className="bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" /> Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </CardTitle>
          <CardDescription>
            Manage account and platform security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "twoFactor",
              label: "Two-Factor Authentication",
              desc: "Require 2FA on admin accounts",
            },
            {
              key: "requireEmailVerification",
              label: "Require Email Verification",
              desc: "New vendors must verify their email",
            },
            {
              key: "autoApproveVendors",
              label: "Auto-Approve Vendors",
              desc: "Skip manual review for trusted categories",
            },
          ].map((opt, i) => (
            <div key={opt.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch
                  checked={security[opt.key]}
                  onCheckedChange={(v) =>
                    setSecurity({ ...security, [opt.key]: v })
                  }
                />
              </div>
              {i < 2 && <Separator className="mt-4" />}
            </div>
          ))}
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPwOpen(true)}>
              <Lock className="h-4 w-4 mr-2" /> Change Admin Password
            </Button>
            <Button
              onClick={() => save("security")}
              className="bg-primary text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" /> Save Security
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Change Admin Password
            </DialogTitle>
            <DialogDescription>
              Use at least 8 characters with an uppercase letter and a number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type={showPw ? "text" : "password"}
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type={showPw ? "text" : "password"}
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input
                type={showPw ? "text" : "password"}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide passwords
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" /> Show passwords
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={changePassword}
              className="bg-primary text-primary-foreground"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
