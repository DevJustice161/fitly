import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import StatisticCard from "@/components/admin/StatisticCard";
import { adminCustomers } from "@/data/adminManagementData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const FILTERS = ["All", "Active", "Inactive", "Suspended"];

const initials = (name) =>
  String(name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AdminCustomers = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { toast } = useToast();
  const [customers, setCustomers] = useState(adminCustomers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCustomers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const capitalizeWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const capitalizeSentence = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const setStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/customers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update product status");
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      );

      toast({
        title: `Customer ${status.toLowerCase()}`,
        description: `Account status updated to ${status}.`,
      });
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  const remove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/customers/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update product status");
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSelected(null);
      toast({
        title: "Customer deleted",
        description: "The customer account has been removed.",
      });
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = customers.filter((c) => {
    const matchesQuery =
      !q ||
      [c.name, c.email, c.phone, c.location, c.id].some((f) =>
        String(f).toLowerCase().includes(q),
      );
    return (
      matchesQuery && (filter === "All" || capitalizeWord(c.status) === filter)
    );
  });

  const totalSpent = customers.reduce((s, c) => Number(s) + Number(c.spent), 0);
  const totalOrders = customers.reduce(
    (s, c) => Number(s) + Number(c.orders),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Manage Customers
        </h1>
        <p className="text-sm text-muted-foreground">
          View, suspend or remove customer accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticCard
          label="Total Customers"
          value={customers.length}
          icon={Users}
          tone="pink"
        />
        <StatisticCard
          label="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          tone="blue"
        />
        <StatisticCard
          label="Lifetime Value"
          value={`${currencySymbol}${totalSpent.toLocaleString()}`}
          icon={Wallet}
          tone="gold"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone or location..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilter(f)}
          >
            {f}{" "}
            {f !== "All" &&
              `(${customers.filter((c) => capitalizeWord(c.status) === f).length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your search or filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    <AvatarImage
                      src={`${BACKEND_URL}/uploads/avatars/${c.avatar}`}
                      alt={`${c.avatar} logo`}
                    />
                    <AvatarFallback className="bg-secondary text-xs font-medium">
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">
                        {c.name}
                      </p>
                      <StatusBadge status={capitalizeWord(c.status)} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {c.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.orders} {c.orders <= 1 ? "order" : "orders"} •
                      {currencySymbol}
                      {Number(c.spent).toLocaleString()} spent • {c.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setSelected(c)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  {c.status === "suspended" ? (
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setStatus(c.id, "active")}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Reactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setStatus(c.id, "suspended")}
                    >
                      <Ban className="h-3 w-3 mr-1" /> Suspend
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive"
                    onClick={() => setConfirmAction(c)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  Joined{" "}
                  {new Date(selected.joined).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {selected.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {selected.phone}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {selected.location}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {selected.orders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {currencySymbol}
                      {Number(selected.spent).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Delivered Orders
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {selected.deliveredOrders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Cancelled Orders
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {selected.cancelledOrders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Wallet Orders
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {selected.walletOrders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Average Order Value
                    </p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {currencySymbol}
                      {Number(selected.averageOrderValue).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last order:{" "}
                  {new Date(selected.lastOrder).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction &&
                `${confirmAction.name} will be deleted permanently, this action cannot be undone.`}
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

export default AdminCustomers;
