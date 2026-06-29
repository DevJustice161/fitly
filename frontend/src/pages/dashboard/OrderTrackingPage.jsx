import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Copy,
  Store,
  Home,
  User,
  Receipt,
  AlertCircle,
  RefreshCw,
  Headphones,
  Star,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";

const API_URL = "http://localhost:5000/api/orders";

const STATUS_STEPS = [
  {
    key: "Pending",
    label: "Order placed",
    icon: Clock,
    desc: "Payment confirmed",
  },
  {
    key: "Processing",
    label: "Processing",
    icon: Package,
    desc: "Vendor preparing",
  },
  {
    key: "Shipped",
    label: "Out for delivery",
    icon: Truck,
    desc: "On the way",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: CheckCircle,
    desc: "Package arrived",
  },
];

const STATUS_MAP = {
  pending_payment: "Pending",
  paid: "Processing",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

const buildTimeline = (order) => {
  if (!order?.created_at) return [];

  const base = new Date(order.created_at);
  const fmt = (d) =>
    d.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const fmtTime = (d) =>
    d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  const add = (days, extraHours = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(9 + extraHours, 30);
    return d;
  };

  const firstStore = order.items?.[0]?.store_name ?? "Vendor";

  const events = [
    {
      title: "Order placed",
      location: "Fitly.ng Marketplace",
      date: fmt(base),
      time: fmtTime(base),
      desc: `Payment confirmed. Order #${order.order_id}.`,
      step: 0,
    },
    {
      title: "Confirmed by vendor",
      location: `${firstStore} · Lagos`,
      date: fmt(add(0, 1)),
      time: fmtTime(add(0, 1)),
      desc: "Vendor accepted and started preparing.",
      step: 1,
    },
    {
      title: "Package picked up",
      location: "Fitly Logistics Hub, Ikeja",
      date: fmt(add(1)),
      time: fmtTime(add(1)),
      desc: "Collected by Fitly Express courier.",
      step: 2,
    },
    {
      title: "In transit",
      location: "Distribution center, Lagos",
      date: fmt(add(2)),
      time: fmtTime(add(2)),
      desc: "Package sorted and routed to destination.",
      step: 2,
    },
    {
      title: "Out for delivery",
      location: `Local courier · ${order.customer_city ?? "Lagos"}`,
      date: fmt(add(3)),
      time: fmtTime(add(3)),
      desc: "Courier heading to your address now.",
      step: 2,
      isActive: true,
    },
  ];

  if (order.delivered_at) {
    const deliveredDate = new Date(order.delivered_at);
    events.push({
      title: "Delivered",
      location: "Customer address",
      date: fmt(deliveredDate),
      time: fmtTime(deliveredDate),
      desc: "Package successfully delivered.",
      step: 3,
      isActive: true,
    });
  }

  return events.reverse(); // most recent first
};

const StepperBar = ({ currentStep }) => {
  const pct =
    currentStep < 0 ? 0 : (currentStep / (STATUS_STEPS.length - 1)) * 100;
  return (
    <div className="relative mb-4">
      <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-0.5 bg-muted z-0">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between relative z-10">
        {STATUS_STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2 flex-1 px-1"
            >
              <div
                className={[
                  "h-9 w-9 rounded-full flex items-center justify-center transition-all",
                  done ? "bg-primary/20 text-primary" : "",
                  active
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow"
                    : "",
                  !done && !active ? "bg-muted text-muted-foreground" : "",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimelineDot = ({ isActive }) => (
  <div
    className={[
      "absolute left-0 top-1 h-5 w-5 rounded-full flex items-center justify-center ring-4 ring-background transition-all",
      isActive ? "bg-primary" : "bg-primary/30",
    ].join(" ")}
  >
    <div
      className={`h-2 w-2 rounded-full ${isActive ? "bg-primary-foreground" : "bg-muted-foreground"}`}
    />
  </div>
);

const DeliveryMap = ({ progress }) => (
  <div className="relative h-44 bg-secondary/50 rounded-lg overflow-hidden">
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M 28 0 L 0 0 0 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 180"
      preserveAspectRatio="none"
    >
      <path
        d="M 40 150 Q 110 130 160 100 T 270 60 Q 320 45 360 35"
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 40 150 Q 110 130 160 100 T 270 60 Q 320 45 360 35"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />
      <path
        d="M 40 150 Q 110 130 160 100 T 270 60 Q 320 45 360 35"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${progress} 100`}
      />
    </svg>
    {/* Vendor pin */}
    <div
      className="absolute flex flex-col items-center"
      style={{ left: "8%", top: "72%" }}
    >
      <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md ring-2 ring-background">
        <Store className="h-3.5 w-3.5" />
      </div>
      <span className="mt-1 text-[9px] bg-background/90 px-1.5 py-0.5 rounded shadow-sm font-medium whitespace-nowrap border border-border">
        Vendor
      </span>
    </div>
    {/* Customer pin */}
    <div
      className="absolute flex flex-col items-center"
      style={{ left: "83%", top: "12%" }}
    >
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md ring-2 ring-background">
        <Home className="h-3.5 w-3.5" />
      </div>
      <span className="mt-1 text-[9px] bg-background/90 px-1.5 py-0.5 rounded shadow-sm font-medium whitespace-nowrap border border-border">
        You
      </span>
    </div>
    {/* Courier pin (animated) */}
    <div
      className="absolute transition-all duration-700"
      style={{
        left: `${8 + (progress / 100) * 75}%`,
        top: `${72 - (progress / 100) * 60}%`,
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 h-9 w-9 rounded-full bg-primary/25 animate-ping" />
        <div className="relative h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-background">
          <Truck className="h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
);

const OrderTrackingPage = () => {
  const { user } = useAuth();
  const { createNewConversation, sendMessage } = useMessages();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [order, setOrder] = useState(null); // null = not yet loaded
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/track/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch order");
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (
    order?.status === "failed" ||
    order?.status === "cancelled" ||
    order?.status === "pending_payment"
  ) {
    navigate("/dashboard/orders");
    toast({
      title: "Cannot track order",
      description: `Order ${order.order_id} has been cancelled or failed or is pending confirmations!.`,
    });
  }

  const normalizedStatus = order
    ? (STATUS_MAP[order.status] ?? order.status)
    : null;
  const currentStep = normalizedStatus
    ? STATUS_STEPS.findIndex((s) => s.key === normalizedStatus)
    : -1;
  const mapProgress =
    currentStep >= 0 ? ((currentStep + 1) / STATUS_STEPS.length) * 100 : 0;
  const timeline = useMemo(() => (order ? buildTimeline(order) : []), [order]);
  const visibleTimeline = timeline.filter((e) => e.step <= currentStep);

  const subtotal =
    order?.items?.reduce(
      (sum, i) => sum + parseFloat(i.discount_price ?? i.price ?? 0),
      0,
    ) ?? 0;
  const deliveryFee = parseFloat(order?.delivery_fee ?? 0);
  const total = parseFloat(subtotal + deliveryFee);

  const courier = order?.courier?.[0] ?? null;

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const copyId = () => {
    if (!order?.order_id) return;
    navigator.clipboard.writeText(order.order_id).catch(() => {});
    toast({
      title: "Copied",
      description: `${order.order_id} copied to clipboard.`,
    });
  };

  const handleVendorMessage = async (item) => {
    try {
      const convo = {
        buyerId: user.id,
        vendorId: item.vendor_id,
        productId: item.product_id,
        orderId: order.id, // numeric id from API
      };
      const creating = await createNewConversation(convo);
      const formData = new FormData();
      formData.append("conversationId", creating.id);
      formData.append("receiverId", user.id);
      formData.append("senderId", item.vendor_id);
      formData.append(
        "message",
        `👋 Welcome! Thanks for contacting ${creating.otherUserName}. We're here to help with any questions about your order or our products.`,
      );
      await sendMessage(formData);
      navigate("/dashboard/messages");
    } catch (err) {
      console.error("Message error:", err);
      toast({
        title: "Error",
        description: "Could not open chat. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleSupport = (action) => {
    toast({ title: action, description: "Connecting you with support…" });
  };

  const badgeClass =
    normalizedStatus === "Delivered"
      ? "bg-green-100 text-green-700 border-green-200"
      : normalizedStatus === "Shipped"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : normalizedStatus === "Processing"
          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
          : normalizedStatus === "Cancelled"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-muted text-muted-foreground border-border";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading order details…</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Order not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/orders")}
        >
          Back to orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/orders")}
            className="rounded-full border-border"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Track order
            </h1>
            <p className="text-xs text-muted-foreground">
              Order ID: {order.order_id}
            </p>
          </div>
        </div>
        <Badge
          className={`px-3 py-1 border text-xs font-medium rounded-full ${badgeClass}`}
        >
          {normalizedStatus === "Shipped"
            ? "Out for delivery"
            : normalizedStatus}
        </Badge>
      </div>

      {normalizedStatus === "Shipped" && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
          <Truck className="h-4 w-4 flex-shrink-0" />
          <span>
            Your courier is on the way. Estimated delivery:{" "}
            <strong>{fmtDate(order.estimated_delivery)}</strong>.
          </span>
        </div>
      )}
      {normalizedStatus === "Delivered" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Your order was delivered on{" "}
            <strong>{fmtDate(order.delivered_at)}</strong>. Enjoy!
          </span>
        </div>
      )}

      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Order items
          </p>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3 items-start">
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden"
                    style={{
                      minWidth: 72,
                      minHeight: 72,
                      width: 72,
                      height: 72,
                    }}
                  >
                    {item.thumbnail ? (
                      <img
                        src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ProductIcon name={item.product_name} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      by {item.store_name}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        `Size: ${item.size}`,
                        `Color: ${item.color}`,
                        `Qty: ${item.quantity}`,
                      ].map((c) => (
                        <span
                          key={c}
                          className="text-[11px] bg-secondary border border-border rounded px-2 py-0.5 text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {item.discount_price &&
                        parseFloat(item.discount_price) <
                          parseFloat(item.price) ? (
                          <>
                            <p className="font-semibold text-base text-foreground">
                              ₦
                              {parseFloat(item.discount_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground line-through">
                              ₦{parseFloat(item.price).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold text-base text-foreground">
                            ₦{parseFloat(item.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyId}
                          className="rounded-full text-xs border-border h-8"
                        >
                          <Copy className="h-3 w-3 mr-1" /> {order.order_id}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVendorMessage(item)}
                          className="rounded-full text-xs bg-primary text-primary-foreground h-8"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message {item.store_name.split(" ")[0]}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Shipment progress
          </p>
          <StepperBar currentStep={currentStep} />
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-2 flex-wrap gap-2">
            <span>
              Placed:{" "}
              <strong className="text-foreground">
                {fmtDate(order.created_at)}
              </strong>
            </span>
            <span>
              Carrier:{" "}
              <strong className="text-foreground">
                {courier?.company ?? "Fitly Express"}
              </strong>
            </span>
            <span>
              Est. delivery:{" "}
              <strong className="text-foreground">
                {fmtDate(order.estimated_delivery)}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Live route
            </p>
            <DeliveryMap progress={mapProgress} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground">Distance</p>
                <p className="font-semibold text-sm text-foreground mt-0.5">
                  12.4 km
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground">ETA</p>
                <p className="font-semibold text-sm text-foreground mt-0.5">
                  {normalizedStatus === "Delivered" ? "Delivered ✓" : "~2h 15m"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Delivery timeline
            </p>
            <div className="relative pl-8">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-5">
                {visibleTimeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                ) : (
                  visibleTimeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <TimelineDot isActive={idx === 0} />
                      <div className="flex justify-between gap-2 items-baseline">
                        <p className="text-sm font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {event.time}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.desc}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {event.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Customer info
            </p>
            {[
              { label: "Name", value: order.customer_name },
              { label: "Phone", value: order.customer_phone },
              { label: "Email", value: order.customer_email },
              {
                label: "Address",
                value: `${order.shipping_address}, ${order.customer_city}, ${order.customer_state}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-border last:border-0 text-sm gap-3"
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {label}
                </span>
                <span className="font-medium text-right">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Order summary
            </p>
            {[
              { label: "Order ID", value: order.order_id },
              { label: "Placed", value: fmtDate(order.created_at) },
              {
                label: "Payment",
                value: (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Paid · {order.payment_method}
                  </span>
                ),
              },
              { label: "Subtotal", value: `₦${subtotal.toLocaleString()}` },
              {
                label: "Delivery fee",
                value:
                  deliveryFee === 0
                    ? "Free"
                    : `₦${deliveryFee.toLocaleString()}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-border text-sm gap-3"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-base">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {courier && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {courier.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {courier.company} ·{" "}
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {courier.rating}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border"
              onClick={() =>
                toast({ title: "Calling courier…", description: courier.phone })
              }
            >
              <Phone className="h-4 w-4 mr-1" /> Call courier
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5" /> Need help?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border text-xs"
              onClick={() => handleSupport("Report an issue")}
            >
              <AlertCircle className="h-3.5 w-3.5 mr-1" /> Report an issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border text-xs"
              onClick={() => handleSupport("Start a return")}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Start a return
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border text-xs"
              onClick={() => handleSupport("Re-track order")}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" /> Track again
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-primary text-primary-foreground text-xs"
              onClick={() => handleSupport("Contact support")}
            >
              <Headphones className="h-3.5 w-3.5 mr-1" /> Contact support
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground text-center">
        Questions? Email{" "}
        <span className="text-primary font-medium">support@fitly.ng</span> or
        call <span className="text-primary font-medium">0800-FITLY-NG</span>
      </p>
    </div>
  );
};

export default OrderTrackingPage;
