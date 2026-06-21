import { useState } from "react";
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
import { mockOrders } from "@/data/dashboardData";

const statusFilters = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

const statusColor = (status) => {
  const map = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
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
          {/* Product Info */}
          <div className="flex gap-4">
            <img
              src={order.image}
              alt={order.product}
              className="h-20 w-20 rounded-lg object-cover bg-muted"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{order.product}</p>
              <p className="text-xs text-muted-foreground">by {order.vendor}</p>
              <p className="font-heading font-semibold text-foreground mt-1">
                ₦{order.price.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Order ID:</span>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">{order.date}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p className="font-medium">{order.size}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Color:</span>
              <p className="font-medium">{order.color}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>
              <p className="font-medium">{order.quantity}</p>
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

          {/* Tracking Progress */}
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

          {/* Price Breakdown */}
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Price Summary</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{order.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>₦1,500</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₦{(order.price + 1500).toLocaleString()}</span>
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
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">{order.date}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="font-medium mb-2">Items</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{order.product}</p>
                <p className="text-xs text-muted-foreground">
                  {order.size} · {order.color} · Qty: {order.quantity}
                </p>
              </div>
              <p className="font-medium">₦{order.price.toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{order.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>₦1,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (0%)</span>
              <span>₦0</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₦{(order.price + 1500).toLocaleString()}</span>
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
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = mockOrders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      o.product_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleInvoice = (order) => {
    setSelectedOrder(order);
    setInvoiceOpen(true);
  };

  const handleReorder = (order) => {
    toast({
      title: "Item added to cart",
      description: `${order.product} has been added to your cart.`,
    });
    navigate("/cart");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        My Orders
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full border-border"
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

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card
              key={order.id}
              className="border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={order.image}
                    alt={order.product}
                    className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.product}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {order.vendor}
                        </p>
                      </div>
                      <Badge
                        className={`${statusColor(order.status)} border-0 text-xs`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Order: {order.id}</span>
                      <span>Date: {order.date}</span>
                      <span>Size: {order.size}</span>
                      <span>Color: {order.color}</span>
                      <span>Qty: {order.quantity}</span>
                    </div>
                    <p className="font-heading font-semibold text-foreground">
                      ₦{order.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {(order.status === "Shipped" ||
                    order.status === "Pending") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs border-primary text-primary"
                      onClick={() =>
                        navigate(`/dashboard/orders/${order.id}/track`)
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
                    onClick={() => handleReorder(order)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Reorder
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

      {/* Dialogs */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onClose={setDetailsOpen}
      />
      <InvoiceDialog
        order={selectedOrder}
        open={invoiceOpen}
        onClose={setInvoiceOpen}
      />
    </div>
  );
};

export default OrdersPage;
