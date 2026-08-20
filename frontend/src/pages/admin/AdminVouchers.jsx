import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Copy,
  Trash2,
  Pencil,
  Percent,
  Users,
  TrendingUp,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatisticCard from "@/components/admin/StatisticCard";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const emptyForm = {
  code: "",
  type: "percentage",
  discount: 10,
  minOrder: 0,
  maxUses: 100,
  expiry: "",
  active: true,
  description: "",
};

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const API_URL = import.meta.env.VITE_API_URL;
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/vouchers`);
      const data = await response.json();

      setVouchers(data);
    } catch (error) {
      toast.error("Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);
  const isExpired = (v) => v.expires_at && new Date(v.expires_at) < new Date();

  const filtered = vouchers
    .filter((v) =>
      tab === "all"
        ? true
        : tab === "active"
          ? v.is_active && !isExpired(v)
          : tab === "inactive"
            ? !v.active
            : isExpired(v),
    )
    .filter(
      (v) =>
        !search.trim() ||
        v.code.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase()),
    );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (v) => {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error("Voucher code is required");

    if (form.type !== "shipping" && Number(form.discount) <= 0) {
      return toast.error("Enter a valid discount value");
    }

    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.type,
        discount_value: Number(form.discount),
        min_order_amount: Number(form.minOrder),
        usage_limit: Number(form.maxUses),
        expires_at: form.expiry,
        description: form.description,
        is_active: form.active,
        vendor_id: null,
        user_id: null,
      };

      const response = await fetch(
        editing ? `${API_URL}/vouchers/${editing.id}` : `${API_URL}/vouchers`,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return toast.error(data.message);
      }

      toast.success(editing ? "Voucher updated" : "Voucher created");

      fetchVouchers();
      setOpen(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };
  const toggleActive = async (voucher) => {
    try {
      const response = await fetch(`${API_URL}/vouchers/toggle/${voucher.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) return toast.error(data.message);

      toast.success(data.message);

      fetchVouchers();
    } catch {
      toast.error("Unable to update voucher");
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/vouchers/${deleting.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) return toast.error(data.message);

      toast.success(data.message);

      fetchVouchers();

      setDeleting(null);
    } catch {
      toast.error("Unable to delete voucher");
    }
  };

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`${code} copied`);
  };

  const label = (v) => {
    if (v.discount_type === "percentage")
      return `${Number(v.discount_value)}% off`;

    if (v.discount_type === "fixed")
      return `${currencySymbol}${Number(v.discount_value).toLocaleString()} off`;

    return "Free Shipping";
  };

  const totalRedemptions = vouchers.reduce(
    (sum, v) => sum + Number(v.used_count || 0),
    0,
  );
  const isVoucherActive = (voucher) => {
    const expired =
      voucher.expires_at && new Date(voucher.expires_at) < new Date();

    const exhausted =
      voucher.usage_limit && voucher.used_count >= voucher.usage_limit;

    return voucher.is_active && !expired && !exhausted;
  };

  const activeCount = vouchers.filter(isVoucherActive).length;

  const expiredCount = vouchers.filter(isExpired).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Manage Vouchers
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and control platform-wide discount codes.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" /> New Voucher
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          label="Total Vouchers"
          value={vouchers.length}
          icon={Ticket}
          tone="gold"
        />
        <StatisticCard
          label="Active"
          value={activeCount}
          icon={Percent}
          tone="green"
        />
        <StatisticCard
          label="Total Redemptions"
          value={totalRedemptions}
          icon={Users}
          tone="pink"
        />
        <StatisticCard
          label="Expired"
          value={vouchers.filter(isExpired).length}
          icon={TrendingUp}
          tone="red"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or description"
          className="sm:max-w-xs"
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-10 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="font-heading text-lg">No vouchers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((v) => (
            <Card
              key={v.id}
              className="border border-border shadow-sm rounded-xl"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-lg font-bold tracking-wide">
                        {v.code}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copy(v.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      isExpired(v)
                        ? "destructive"
                        : v.is_active
                          ? "default"
                          : "secondary"
                    }
                  >
                    {isExpired(v)
                      ? "Expired"
                      : v.is_active
                        ? "Active"
                        : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>
                    Discount:{" "}
                    <span className="text-foreground font-medium">
                      {label(v)}
                    </span>
                  </p>
                  <p>
                    Min order:{" "}
                    <span className="text-foreground font-medium">
                      {currencySymbol}
                      {Number(v.min_order_amount).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Used:{" "}
                    <span className="text-foreground font-medium">
                      {v.used_count}/{v.usage_limit}
                    </span>
                  </p>
                  <p>
                    Expires:{" "}
                    <span className="text-foreground font-medium">
                      {new Date(v.expires_at).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) || "—"}
                    </span>
                  </p>
                </div>

                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, (v.used_count / (v.usage_limit || 1)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.is_active}
                      onCheckedChange={() => toggleActive(v)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {v.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(v)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleting(v)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Edit Voucher" : "Create Voucher"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="FITLY10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="shipping">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  {form.type === "percentage"
                    ? "Discount (%)"
                    : `Discount (${currencySymbol})`}
                </Label>
                <Input
                  type="number"
                  disabled={form.type === "shipping"}
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Min. Order ({currencySymbol})</Label>
                <Input
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm({ ...form, minOrder: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Uses</Label>
                <Input
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry</Label>
                <Input
                  type="date"
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder={`10% off all orders above ${currencySymbol}10,000`}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Label>Active</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(val) => setForm({ ...form, active: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Save Changes" : "Create Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer be able to redeem this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

export default AdminVouchers;
