import { useState, useEffect, useRef } from "react";
import { Search, Printer, MessageCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const statusColors = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-purple-100 text-purple-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const VendorOrders = () => {
  const { user, token } = useAuth();
  const { siteDetails, domain, brand, extension } = useSiteDetails();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filters = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const [loading, setLoading] = useState(true);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const invoiceRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = siteDetails?.currencySymbol || "₦";

  const filtered = orders.filter((order) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      order.order_id.toString().includes(keyword) ||
      order.product_name.toLowerCase().includes(keyword) ||
      order.customer_name.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "All" || order.status.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const fetchCouriers = async () => {
    try {
      const response = await fetch(`${API_URL}/couriers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load couriers");
      }

      setCouriers(data);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/vendors/orders/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setOrders(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to load orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCouriers();
    fetchOrders();
  }, []);

  const statusNameChange = (status) => {
    const map = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return map[status] || status;
  };

  const handleStatusChange = async (id, status, orderId) => {
    try {
      const res = await fetch(`${API_URL}/vendors/orders/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, orderId }),
      });

      if (!res.ok) throw new Error();

      fetchOrders();

      toast({
        title: "Updated",
        description: "Order updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: "Couldn't update order.",
        variant: "destructive",
      });
    }
  };

  const handleCourierChange = async (id, courier, orderId) => {
    try {
      const res = await fetch(`${API_URL}/couriers/item-change/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courier, orderId }),
      });

      if (!res.ok) throw new Error();

      fetchOrders();

      toast({
        title: "Courier Updated",
        description: "Order updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: "Couldn't update order.",
        variant: "destructive",
      });
    }
  };

  const openInvoice = (order) => {
    setSelected(order);
    setInvoiceOpen(true);
  };
  const openContact = (order) => {
    setSelected(order);
    setMessage("");
    setContactOpen(true);
  };

  const handlePrint = () => {
    const content = invoiceRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>Invoice ${selected.id}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
        h1,h2,h3 { margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
        .right { text-align: right; }
        .muted { color: #666; font-size: 13px; }
        .total { font-size: 18px; font-weight: 700; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Orders
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
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
        {filtered.map((order) => (
          <Card
            key={order.order_item_id}
            className="border border-border shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={`${BACKEND_URL}/uploads/products/${order.thumbnail}`}
                  alt={order.product_name}
                  className="h-20 w-20 rounded-lg object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {order.product_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_id} • {order.customer_name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[statusNameChange(order.status)]}`}
                    >
                      {statusNameChange(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm flex-wrap ">
                    <div>
                      <span className="text-muted-foreground">Price:</span>{" "}
                      <span className="font-semibold">
                        {currencySymbol}
                        {Number(order.price).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>{" "}
                      <span className="font-semibold">{order.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>{" "}
                      <span className="font-semibold">{order.size}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Color:</span>{" "}
                      <span className="font-semibold">{order.color}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm flex-wrap mb-2">
                    <div>
                      <span className="text-muted-foreground">Payment:</span>{" "}
                      <span className="font-semibold">
                        {order.payment_method}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-semibold">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commission:</span>{" "}
                      <span className="text-destructive">
                        -{currencySymbol}
                        {Number(order.commission).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">You Earn:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {currencySymbol}
                        {Number(order.earning).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleStatusChange(
                          order.order_item_id,
                          v,
                          order.orderId,
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "pending",
                          "processing",
                          "shipped",
                          "delivered",
                          "cancelled",
                        ].map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusNameChange(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={order.default_courier}
                      onValueChange={(v) =>
                        handleCourierChange(
                          order.order_item_id,
                          v,
                          order.orderId,
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {couriers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => openInvoice(order)}
                    >
                      <Printer className="h-3 w-3 mr-1" /> Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Order {selected?.order_id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div ref={invoiceRef} className="space-y-4 text-foreground">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold">{selected.store_name}</h2>
                  <p className="muted text-sm text-muted-foreground">
                    {selected.vendor_address}
                  </p>
                  <p className="muted text-sm text-muted-foreground">
                    {selected.vendor_email} • {selected.vendor_phone}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.order_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selected.created_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="muted text-muted-foreground">Billed To</p>
                  <p className="font-medium">{selected.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="muted text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {statusNameChange(selected.status)}
                  </p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Item</th>
                    <th className="right text-right py-2">Amount</th>
                    <th className="right text-right py-2">Quantity</th>
                    <th className="right text-right py-2">Size</th>
                    <th className="right text-right py-2">Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2">{selected.product_name}</td>
                    <td className="right text-right py-2">
                      {currencySymbol}
                      {Number(selected.total).toLocaleString()}
                    </td>
                    <td className="text-right py-2">{selected.quantity}</td>
                    <td className="text-right py-2">{selected.size}</td>
                    <td className="text-right py-2">{selected.color}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">
                      Platform Commission
                    </td>
                    <td className="right text-right py-2 text-destructive">
                      -{currencySymbol}
                      {Number(selected.commission).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 total font-bold">Vendor Earnings</td>
                    <td className="right text-right py-3 total font-bold">
                      {currencySymbol}
                      {Number(selected.earning).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                Thank you for selling on {domain}.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrders;
