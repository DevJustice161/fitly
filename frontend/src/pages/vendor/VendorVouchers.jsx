import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Pencil,
  TrendingUp,
  Users,
  Percent,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "fitly_vendor_vouchers";

const emptyForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  usage_limit: 100,
  expires_at: "",
  is_active: 1,
  description: "",
};

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const VendorVouchers = () => {
  const { user, token } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [copied, setCopied] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [tab, setTab] = useState("all");
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getVouchers = async () => {
    try {
      const response = await fetch(`${API_URL}/vouchers/vendor/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vouchers");
      }
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching vouchers");
    }
  };

  useEffect(() => {
    getVouchers();
  }, []);

  const persist = (next) => {
    setVouchers(next);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      code: v.code,
      discount_type: v.discount_type,
      discount_value: v.discount_value,
      min_order_amount: v.min_order_amount,
      usage_limit: v.usage_limit,
      expires_at: v.expires_at,
      is_active: v.is_active,
      description: v.description,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error("Voucher code is required");
    if (!form.expires_at) return toast.error("Expiry date is required");
    const code = form.code.trim().toUpperCase();

    if (editing) {
      if (form.discount_type === "percentage") {
        if (form.discount_value > 100) {
          toast.error("Percentage value cannot exceed 100%");
          return;
        }
      }
      const newV = {
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_amount: form.min_order_amount,
        expires_at: form.expires_at,
        usage_limit: form.usage_limit,
        is_active: form.is_active,
        description: form.description,
        code: form.code,
      };

      try {
        const response = await fetch(`${API_URL}/vouchers/${editing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newV),
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to update voucher");
      }
      getVouchers();
      toast.success("Voucher updated");
    } else {
      const exists = vouchers.some((v) => v.code === code);
      if (exists) return toast.error("Voucher code already exists");
      const newV = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_amount: form.min_order_amount,
        expires_at: form.expires_at,
        usage_limit: form.usage_limit,
        user_id: null,
        vendor_id: user.id,
        description: form.description,
        is_active: form.is_active,
      };

      try {
        const response = await fetch(`${API_URL}/vouchers/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newV),
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to create new voucher");
      }
      getVouchers();

      toast.success("Voucher created");
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/vouchers/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete voucher");
    }
    getVouchers();
    toast.success("Voucher deleted");
    setDeleteId(null);
  };

  const toggleActive = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vouchers/toggle/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete voucher");
    }
    getVouchers();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const now = new Date();
  const isExpired = (v) =>
    new Date(v.expires_at) < now || v.used_count >= v.usage_limit;

  const filtered = vouchers.filter((v) => {
    if (tab === "active") return v.is_active && !isExpired(v);
    if (tab === "expired") return isExpired(v) || !v.is_active;
    return true;
  });

  const stats = {
    total: vouchers.length,
    active: vouchers.filter((v) => v.is_active && !isExpired(v)).length,
    redemptions: vouchers.reduce((s, v) => s + v.used_count, 0),
    avgDiscount:
      vouchers.length === 0
        ? 0
        : Math.round(
            vouchers
              .filter((v) => v.discount_type === "percentage")
              .reduce((s, v) => s + v.discount_value, 0) /
              Math.max(
                1,
                vouchers.filter((v) => v.discount_type === "percentage").length,
              ),
          ),
  };

  const displayValue = (v) => {
    if (v.discount_type === "percentage") return `${v.discount_value}% OFF`;
    if (v.discount_type === "fixed")
      return `${formatNaira(v.discount_value)} OFF`;
    return "FREE SHIPPING";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Vouchers & Promotions
          </h1>
          <p className="text-sm text-muted-foreground">
            Create discount codes to boost sales and attract customers.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1" /> Create Voucher
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: "Total Vouchers",
            value: stats.total,
            icon: Ticket,
            color: "text-primary",
          },
          {
            label: "Active",
            value: stats.active,
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            label: "Redemptions",
            value: stats.redemptions,
            icon: Users,
            color: "text-amber-600",
          },
          {
            label: "Avg. Discount",
            value: `${stats.avgDiscount}%`,
            icon: Percent,
            color: "text-rose-500",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground font-heading">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({vouchers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="expired">Inactive/Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No vouchers in this view.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filtered.map((v) => {
                const expired = isExpired(v);
                const usagePct = Math.min(
                  100,
                  Math.round((v.used_count / v.usage_limit) * 100),
                );
                return (
                  <Card
                    key={v.id}
                    className={`border shadow-sm relative overflow-hidden p-4 ${
                      expired || !v.is_active ? "opacity-70" : ""
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-5 w-5 text-primary" />
                          <span className="font-heading text-xl font-bold text-primary">
                            {displayValue(v)}
                          </span>
                        </div>
                        <Badge
                          className={`text-[10px] border-0 ${
                            expired
                              ? "bg-muted text-muted-foreground"
                              : v.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {expired
                            ? "Expired"
                            : v.is_active
                              ? "Active"
                              : "Paused"}
                        </Badge>
                      </div>

                      {v.description && (
                        <p className="text-sm text-foreground mb-3">
                          {v.description}
                        </p>
                      )}

                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        <p>Min. order: {formatNaira(v.min_order_amount)}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Expires:{" "}
                          {new Date(v.expires_at).toLocaleDateString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground text-center tracking-wider">
                          {v.code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(v.code)}
                          className="rounded-full border-primary text-primary"
                        >
                          {copied === v.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Used {v.used_count} / {v.usage_limit}
                          </span>
                          <span>{usagePct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={v.is_active}
                            onCheckedChange={() => toggleActive(v.id)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {v.is_active ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(v)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(v.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Edit Voucher" : "Create New Voucher"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Voucher Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SUMMER25"
                  className="uppercase"
                />
              </div>

              <div className="col-span-2">
                <Label>Discount Type</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(val) =>
                    setForm({ ...form, discount_type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                    <SelectItem value="shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.type !== "shipping" && (
                <div>
                  <Label>
                    {form.type === "percentage" ? "Discount (%)" : "Amount (₦)"}
                  </Label>
                  <Input
                    type="number"
                    value={parseFloat(form.discount_value).toFixed(0)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_value: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div>
                <Label>Min. Order (₦)</Label>
                <Input
                  type="number"
                  value={parseFloat(form.min_order_amount).toFixed(0)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      min_order_amount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={form.usage_limit}
                  onChange={(e) =>
                    setForm({ ...form, usage_limit: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={new Date(form.expires_at).toLocaleDateString("en-CA")}
                  onChange={(e) =>
                    setForm({ ...form, expires_at: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>Description (optional)</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short promo description customers will see"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 pt-1">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(val) =>
                    setForm({ ...form, is_active: val })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Activate voucher immediately
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Save Changes" : "Create Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer be able to redeem this code. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorVouchers;
