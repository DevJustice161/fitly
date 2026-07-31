import { useState, useEffect } from "react";
import { Search, Trash2, CheckCircle, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const FILTERS = ["All", "Active", "Inactive", "Out of Stock"];

const AdminProducts = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmAction, setConfirmAction] = useState(null);
  const API_URL = "http://localhost:5000/api";

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error fetching products",
        description: "Unable to load app products. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const setStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/products/${id}/status`, {
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

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );

      toast({
        title: `Product ${status.toLowerCase()}`,
        description: `Product status updated to ${status}.`,
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
      const response = await fetch(`${API_URL}/admin/products/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update product status");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmAction(null);

      toast({
        title: "Product deleted",
        description: "The product has been removed from the marketplace.",
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
  const filtered = products.filter((p) => {
    const matchesQuery =
      !q ||
      [p.name, p.vendor, p.category].some((f) =>
        String(f).toLowerCase().includes(q),
      );
    return matchesQuery && (filter === "All" || p.status === filter);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Manage Products
        </h1>
        <p className="text-sm text-muted-foreground">
          Review, approve or remove vendor listings.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, vendors or categories..."
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
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="border border-border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {p.name}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.vendor} • {p.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₦{p.price.toLocaleString()} • {p.stock} in stock
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.status !== "Active" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setStatus(p.id, "Active")}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                  )}
                  {p.status !== "Inactive" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setStatus(p.id, "Inactive")}
                    >
                      <Ban className="h-3 w-3 mr-1" /> Suspend
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive"
                    onClick={() => setConfirmAction(p)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(p) => !p && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction &&
                `${confirmAction.name} will no longer be in the marketplace, this action cannot be undone.`}
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

export default AdminProducts;
