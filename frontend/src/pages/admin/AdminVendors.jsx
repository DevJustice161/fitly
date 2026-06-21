import { useState } from "react";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Star,
  Store,
  Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext.jsx";

const seedVendors = [
  {
    id: "v1",
    name: "Ama Collections",
    owner: "Amara Johnson",
    email: "amara@amacollections.ng",
    category: "Women's fashion",
    city: "Lagos",
    products: 48,
    sales: 3850000,
    rating: 4.8,
    isPremium: true,
    status: "Active",
    joined: "Jan 2024",
  },
  {
    id: "v2",
    name: "Kings Tailoring",
    owner: "Tunde Adeyemi",
    email: "tunde@kings.ng",
    category: "Men's fashion",
    city: "Lagos",
    products: 32,
    sales: 2150000,
    rating: 4.6,
    isPremium: false,
    status: "Active",
    joined: "Feb 2024",
  },
  {
    id: "v3",
    name: "Luxe Accessories NG",
    owner: "Amina Bello",
    email: "amina@luxe.ng",
    category: "Accessories",
    city: "Kano",
    products: 24,
    sales: 985000,
    rating: 4.5,
    isPremium: true,
    status: "Active",
    joined: "Dec 2023",
  },
  {
    id: "v4",
    name: "Royal Fits",
    owner: "Chukwu Eze",
    email: "chukwu@royalfits.ng",
    category: "Men's fashion",
    city: "Port Harcourt",
    products: 18,
    sales: 540000,
    rating: 4.2,
    isPremium: false,
    status: "Suspended",
    joined: "Mar 2024",
  },
  {
    id: "v5",
    name: "Glow Beauty",
    owner: "Blessing Eze",
    email: "blessing@glow.ng",
    category: "Beauty products",
    city: "Abuja",
    products: 56,
    sales: 4250000,
    rating: 4.9,
    isPremium: true,
    status: "Active",
    joined: "Nov 2023",
  },
];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-700",
};

const AdminVendors = () => {
  const API_URL = "http://localhost:5000/api";
  const { toast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  useState(() => {
    fetchVendors();
  }, []);

  const filters = ["All", "Active", "Suspended", "Premium"];

  const filtered = vendors.filter((v) => {
    const s = search.toLowerCase();
    const matchSearch =
      v.store_name.toLowerCase().includes(s) ||
      v.owner.toLowerCase().includes(s);
    const matchFilter =
      filter === "All" ||
      (filter === "Premium" ? v.is_premium : v.v_status === filter);
    return matchSearch && matchFilter;
  });

  const { token } = useAuth();

  const toggleStatus = async (id) => {
    try {
      const vendor = vendors.find((x) => x.user_id === id);

      if (!vendor) return;

      const newStatus = vendor.v_status === "Active" ? "Suspended" : "Active";

      const response = await fetch(`${API_URL}/vendors/status/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          v_status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update vendor status");
      }

      // Update UI after successful DB update
      setVendors((prev) =>
        prev.map((v) => (v.user_id === id ? { ...v, v_status: newStatus } : v)),
      );

      toast({
        title:
          newStatus === "Active" ? "Vendor reactivated" : "Vendor suspended",

        description: `${vendor.store_name} has been updated.`,
      });

      setConfirmAction(null);
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  // const toggleStatus = (id) => {
  //   setVendors((prev) =>
  //     prev.map((v) =>
  //       v.id === id
  //         ? { ...v, v_status: v.v_status === "Active" ? "Suspended" : "Active" }
  //         : v,
  //     ),
  //   );
  //   const v = vendors.find((x) => x.id === id);
  //   toast({
  //     title:
  //       v.v_status === "Active" ? "Vendor suspended" : "Vendor reactivated",
  //     description: `${v.store_name} has been updated.`,
  //   });
  //   setConfirmAction(null);
  // };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          All Vendors
        </h1>
        <p className="text-sm text-muted-foreground">
          {vendors.length} total {vendors.length === 1 ? "vendor" : "vendors"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f ? "bg-primary text-primary-foreground" : ""
              }
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((v) => (
          <Card key={v.id} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarFallback className="bg-primary/10 text-primary font-heading">
                      {v.store_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {v.store_name}
                      </p>
                      {v.is_premium === 1 && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[v.v_status]}`}
                      >
                        {v.v_status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {v.owner} • {v.state}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {/* <span>{v.products} products</span> */}
                      <span>40 products</span>
                      {/* <span>₦{(v.sales / 1000000).toFixed(2)}M sales</span> */}
                      <span>₦{(3000 / 1000000).toFixed(2)}M sales</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {v.rating}
                      </span>
                      <span>{v.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setView(v)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  {v.v_status === "Active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive"
                      onClick={() => setConfirmAction(v)}
                    >
                      <Ban className="h-3 w-3 mr-1" /> Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => toggleStatus(v.user_id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Store className="h-5 w-5" /> {view?.store_name}
            </DialogTitle>
            <DialogDescription>
              Vendor profile and performance
            </DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Owner</p>
                  <p className="font-medium">{view.owner}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{view.email}</p>
                </div>
                {/* <div>
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-medium">{view.category}</p>
                </div> */}
                <div>
                  <p className="text-muted-foreground text-xs">City</p>
                  <p className="font-medium">{view.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Joined</p>
                  <p className="font-medium">
                    {new Date(view.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tier</p>
                  <p className="font-medium">
                    {view.is_premium === 1 ? "Premium" : "Standard"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                <div className="text-center">
                  <p className="font-heading text-lg font-bold">
                    {/* {view.products} */} 40
                  </p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-lg font-bold">
                    {/* ₦{(view.sales / 1000000).toFixed(2)}M */} ₦
                    {(3000 / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-lg font-bold">
                    {view.rating}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction &&
                `${confirmAction.store_name} will no longer be able to receive orders or list products.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleStatus(confirmAction.user_id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVendors;
