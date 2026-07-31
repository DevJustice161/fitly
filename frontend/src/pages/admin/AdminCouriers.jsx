import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Star, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EmptyState from "@/components/admin/EmptyState";
import { adminCouriers } from "@/data/adminManagementData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const emptyForm = {
  name: "",
  company: "",
  email: "",
  location: "",
  coverage: "",
  baseFee: "",
  avgDays: "",
  phone: "",
};

const AdminCouriers = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [couriers, setCouriers] = useState(adminCouriers);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmAction, setConfirmAction] = useState(null);
  const API_URL = "http://localhost:5000/api";

  const fetchCouriers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/couriers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCouriers(data);
    } catch (error) {
      toast({
        title: "Error fetching couriers",
        description: "Unable to load couriers. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      company: c.company,
      email: c.email,
      location: c.location,
      coverage: c.coverage,
      baseFee: String(c.baseFee),
      avgDays: c.avgDays,
      phone: c.phone,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Name required",
        description: "Enter a courier name.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: form.name,
      company: form.company,
      email: form.email,
      location: form.location,
      coverage: form.coverage || "Nationwide",
      base_fee: Number(form.baseFee) || 0,
      avg_days: form.avgDays || "2-4 days",
      phone: form.phone,
    };

    try {
      let response;

      if (editing) {
        response = await fetch(`${API_URL}/admin/couriers/${editing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/admin/couriers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (editing) {
        setCouriers((prev) =>
          prev.map((c) =>
            c.id === editing.id
              ? {
                  ...c,
                  name: payload.name,
                  company: payload.company,
                  email: payload.email,
                  location: payload.location,
                  coverage: payload.coverage,
                  baseFee: payload.base_fee,
                  avgDays: payload.avg_days,
                  phone: payload.phone,
                }
              : c,
          ),
        );

        toast({
          title: "Courier updated",
        });
      } else {
        setCouriers((prev) => [
          ...prev,
          {
            id: data.courier.id,
            deliveries: 0,
            rating: 0,
            active: 1,
            default_courier: 0,
            name: payload.name,
            company: payload.company,
            email: payload.email,
            location: payload.location,
            coverage: payload.coverage,
            baseFee: payload.base_fee,
            avgDays: payload.avg_days,
            phone: payload.phone,
          },
        ]);

        toast({
          title: "Courier added",
        });
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description: error.message,
      });
    }
  };

  const toggleActive = async (id) => {
    try {
      const courier = couriers.find((c) => c.id === id);

      if (!courier) return;

      const newStatus = !courier.active;

      const response = await fetch(`${API_URL}/admin/couriers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update category status");
      }

      const statusNow = newStatus ? 1 : 0;

      setCouriers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: statusNow } : c)),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Toggle Failed",
        description: error.message,
      });
    }
  };

  const remove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/couriers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete courier");
      }

      setCouriers((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Courier removed",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    }
  };

  const setDefaultCourier = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/couriers/default/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCouriers((prev) =>
        prev.map((courier) => ({
          ...courier,
          default_courier: courier.id === id ? 1 : 0,
        })),
      );

      toast({
        title: "Default courier updated",
        description: "This courier will now be used as the platform default.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = couriers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.coverage.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Manage Couriers
          </h1>
          <p className="text-sm text-muted-foreground">
            Delivery partners, coverage and shipping fees.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Courier
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search couriers or coverage..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No couriers found"
          description="Add a delivery partner to get started."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <Card key={c.id} className="border border-border shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{c.company}</p>

                      {c.default_courier === 1 && (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.coverage} • {c.avgDays}
                    </p>
                  </div>

                  <Switch
                    checked={c.active === 1}
                    onCheckedChange={() => toggleActive(c.id)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-heading font-semibold text-foreground">
                    ₦{Number(c.baseFee).toLocaleString()} base fee
                  </span>

                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {c.rating || "—"}
                  </span>

                  <span>
                    {Number(c.deliveries).toLocaleString()}{" "}
                    {Number(c.deliveries) <= 1 ? "delivery" : "deliveries"}
                  </span>

                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!c.default_courier && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => setDefaultCourier(c.id)}
                    >
                      Make Default
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive"
                    onClick={() => setConfirmAction(c)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Edit Courier" : "Add Courier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. GIG Logistics"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tunde A."
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="courier@gmail.com"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Lagos, Nigeria"
              />
            </div>
            <div>
              <Label>Coverage</Label>
              <Input
                value={form.coverage}
                onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                placeholder="Nationwide"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Base fee (₦)</Label>
                <Input
                  type="number"
                  value={form.baseFee}
                  onChange={(e) =>
                    setForm({ ...form, baseFee: e.target.value })
                  }
                  placeholder="3000"
                />
              </div>
              <div>
                <Label>Avg. delivery</Label>
                <Input
                  value={form.avgDays}
                  onChange={(e) =>
                    setForm({ ...form, avgDays: e.target.value })
                  }
                  placeholder="2-4 days"
                />
              </div>
            </div>
            <div>
              <Label>Contact phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0801 234 5678"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save Changes" : "Add Courier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(p) => !p && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Courier?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction &&
                `${confirmAction.company} will be deleted, this action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove(confirmAction.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCouriers;
