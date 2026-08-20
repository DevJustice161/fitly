import { useState, useEffect } from "react";
import { Search, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const FILTERS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error fetching orders",
        description: "Unable to load app orders. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const capitalizeWord = (str) => {
    if (!str) return "";
    if (str === "pending_payment") return "Pending Payment";
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
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );

      toast({
        title: "Order Updated",
        description: data.message,
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

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    const matchesQuery =
      !q ||
      [o.order_id, o.customer, o.vendor, o.paymentMethod].some((f) =>
        String(f).toLowerCase().includes(q),
      );
    const matchesFilter =
      filter === "All" || capitalizeWord(o.status) === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Manage Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and update every order across the marketplace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID, customer, vendor or payment..."
            className="pl-9"
          />
        </div>
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
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try a different search term or filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Card key={o.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{o.order_id}</p>
                    <StatusBadge status={capitalizeWord(o.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {o.customer} • {o.vendor}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.date).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {o.items} {o.items <= 1 ? "item" : "items"} •{" "}
                    {capitalizeWord(o.paymentMethod)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold text-foreground mr-2">
                    {currencySymbol}
                    {Number(o.total).toLocaleString()}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setSelected(o)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  {(o.status === "pending" || o.status === "processing") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setStatus(o.id, "shipped")}
                    >
                      <Truck className="h-3 w-3 mr-1" /> Ship
                    </Button>
                  )}
                  {o.status === "shipped" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setStatus(o.id, "delivered")}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Delivered
                    </Button>
                  )}
                  {o.status !== "cancelled" && o.status !== "delivered" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive"
                      onClick={() => setStatus(o.id, "cancelled")}
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Order {selected?.order_id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span>{selected.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor</span>
                <span>{selected.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{selected.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{capitalizeWord(selected.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>
                  {new Date(selected.date).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={capitalizeWord(selected.status)} />
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-heading font-bold">
                <span>Total</span>
                <span>
                  {currencySymbol}
                  {Number(selected.total).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
