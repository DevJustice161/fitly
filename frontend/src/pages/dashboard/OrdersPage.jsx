import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  RotateCcw,
  Download,
  MapPin,
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const statusFilters = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Failed",
];

const statusColor = (status) => {
  const map = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-purple-100 text-purple-700",
    Cancelled: "bg-red-100 text-red-700",
    Failed: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];

const OrderDetailsDialog = ({ order, open, onClose }) => {
  if (!order) return null;

  const currentStep = statusSteps.indexOf(
    order.status === "Cancelled" ? "Pending" : order.status,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="font-heading font-semibold text-foreground mt-1">
                ₦{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Order ID:</span>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString("en-NG")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge
                className={`${statusColor(order.status)} border-0 text-xs mt-1`}
              >
                {order.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {order.status !== "Cancelled" && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Order Progress
              </p>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => {
                  const isActive = i <= currentStep;
                  const icons = [Clock, Package, Truck, CheckCircle];
                  const Icon = icons[i];
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {step}
                      </span>
                      {i < statusSteps.length - 1 && (
                        <div
                          className={`absolute h-0.5 w-full ${isActive ? "bg-primary" : "bg-muted"}`}
                          style={{ display: "none" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="flex mt-2 mx-4">
                {statusSteps.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full mx-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          )}

          {order.status === "Cancelled" && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm text-center">
              This order has been cancelled.
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Price Summary</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>₦{order.delivery_fee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                ₦
                {(
                  parseInt(order.total) + parseInt(order.delivery_fee)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InvoiceDialog = ({ order, open, onClose }) => {
  if (!order) return null;

  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm" id="invoice-content">
          <div className="text-center border-b border-border pb-3">
            <h2 className="font-heading text-xl font-bold text-primary">
              Fitly.ng
            </h2>
            <p className="text-xs text-muted-foreground">Fashion Marketplace</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Invoice #:</span>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString("en-NG")}
              </p>
            </div>
          </div>

          <Separator />

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>₦{order.delivery_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (0%)</span>
              <span>₦0</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>
                ₦
                {(
                  parseInt(order.total) + parseInt(order.delivery_fee)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
            <p>Thank you for shopping with Fitly.ng</p>
            <p>support@fitly.ng · www.fitly.ng</p>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-primary text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-2" /> Print / Save PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="border-border"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderD, setSelectedOrderD] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/orders";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/user/${user.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.id]);

  const fetchOrderItems = async (orderId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/order-items/${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch orders items");
      }
      setSelectedOrderItems(data);
    } catch (error) {
      console.error("Failed to fetch order items:", error);
      toast({
        title: "Error",
        description: "Failed to load your order items. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedOrder) return;
    fetchOrderItems(selectedOrder.id);
  }, [selectedOrder]);

  const statusNameChange = (status) => {
    const map = {
      pending_payment: "Pending",
      paid: "Processing",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed: "Failed",
    };
    return map[status] || status;
  };

  const methodNameChange = (method) => {
    const map = {
      paystack: "Paystack",
      flutterwave: "Flutterwave",
      transfer: "Bank Transfer",
      ussd: "USSD",
    };
    return map[method] || method;
  };

  const ordersWithNames = orders.map((o) => ({
    ...o,
    status: statusNameChange(o.status),
    payment_method: methodNameChange(o.payment_method),
  }));

  const filtered = ordersWithNames.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      o.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatDate = (d) => {
    const dateObj = new Date(d.replace(" ", "T"));

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);

    return formattedDate;
  };

  const handleViewDetails = (order) => {
    setSelectedOrderD(order);
    setDetailsOpen(true);
  };

  const handleInvoice = (order) => {
    setSelectedOrderD(order);
    setInvoiceOpen(true);
  };

  const handleReorder = (order) => {
    const item = {
      id: order.product_id,
      quantity: order.quantity,
      size: order.size,
      color: order.color,
    };
    addToCart(item);
    toast({
      title: "Item added to cart",
      description: `${order.product_name} has been added to your cart.`,
    });

    navigate("/cart");
  };

  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setSelectedOrder(null)}
        >
          ← Back to Orders
        </Button>

        <Card className="mb-4">
          <CardContent className="p-4 space-y-2">
            <h2 className="font-bold text-xl">
              Order #{selectedOrder.order_id}
            </h2>

            <p>Status: {statusNameChange(selectedOrder.status)}</p>

            {selectedOrder.status === "Delivered" && (
              <div className="flex gap-3">
                <CheckCircle />{" "}
                <p>Delivered on {formatDate(selectedOrder.delivered_at)}</p>
              </div>
            )}

            <p>Total: ₦{Number(selectedOrder.total).toLocaleString()}</p>

            <p>Payment Method: {selectedOrder.payment_method}</p>

            <p>
              Date Ordered:{" "}
              {new Date(selectedOrder.created_at).toLocaleDateString("en-NG")}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedOrderItems?.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                    className=" rounded-lg object-cover"
                    style={{ width: "450px", height: "400px" }}
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name}</h3>

                    <p className="text-sm text-muted-foreground">
                      Vendor: {item.store_name}
                    </p>

                    <p className="text-sm">Size: {item.size}</p>

                    <p className="text-sm">Color: {item.color}</p>

                    <p className="text-sm">Quantity: {item.quantity}</p>

                    <p className="font-semibold mt-2">
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs border-border"
                      onClick={() => handleReorder(item)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Buy this again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
        My Orders
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full border-border "
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className={`rounded-full text-xs ${filter === s ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card>
              <CardContent className="p-4">
                <div
                  key={order.id}
                  className="cursor-pointer hover:shadow-md transition-all mb-4"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.order_id}</h3>

                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-NG")}
                      </p>
                    </div>

                    <Badge className={statusColor(order.status)}>
                      {statusNameChange(order.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">
                        ₦{Number(order.total).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p>{order.payment_method}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p>{order.item_count}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p>{statusNameChange(order.status)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {order.status != "Failed" &&
                    order.status != "Cancelled" &&
                    order.status != "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs border-primary text-primary"
                        onClick={() =>
                          navigate(`/dashboard/orders/${order.order_id}/track`)
                        }
                      >
                        <MapPin className="h-3 w-3 mr-1" /> Track Order
                      </Button>
                    )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs border-border"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs border-border"
                    onClick={() => handleInvoice(order)}
                  >
                    <Download className="h-3 w-3 mr-1" /> Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderDetailsDialog
        order={selectedOrderD}
        open={detailsOpen}
        onClose={setDetailsOpen}
      />
      <InvoiceDialog
        order={selectedOrderD}
        open={invoiceOpen}
        onClose={setInvoiceOpen}
      />
    </div>
  );
};

export default OrdersPage;
