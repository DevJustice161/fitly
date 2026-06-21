import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { mockOrders } from "@/data/dashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";

const statusSteps = [
  {
    key: "Pending",
    label: "Order Placed",
    icon: Clock,
    desc: "We received your order",
  },
  {
    key: "Processing",
    label: "Processing",
    icon: Package,
    desc: "Vendor is preparing your item",
  },
  {
    key: "Shipped",
    label: "Out for Delivery",
    icon: Truck,
    desc: "Your package is on the way",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: CheckCircle,
    desc: "Package arrived safely",
  },
];

const buildTimeline = (order) => {
  const baseDate = new Date(order.created_at);
  const addDays = (d, n) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + n);
    return nd.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const addTime = (n) => {
    const nd = new Date(baseDate);
    nd.setDate(nd.getDate() + n);
    nd.setHours(9 + n, 30);
    return nd.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return [
    {
      title: "Order Placed",
      location: "Fitly.ng Marketplace",
      date: addDays(baseDate, 0),
      time: addTime(0),
      desc: `Order ${order.order_id} placed and payment confirmed.`,
      step: 0,
    },
    {
      title: "Order Confirmed by Vendor",
      location: `${order.store_name} · Lagos`,
      date: addDays(baseDate, 0),
      time: addTime(0),
      desc: "Vendor accepted the order and started preparation.",
      step: 1,
    },
    {
      title: "Package Picked Up",
      location: "Fitly Logistics Hub, Ikeja",
      date: addDays(baseDate, 1),
      time: addTime(1),
      desc: "Package collected by our courier partner.",
      step: 2,
    },
    {
      title: "In Transit",
      location: "Distribution Center, Lagos",
      date: addDays(baseDate, 2),
      time: addTime(2),
      desc: "Heading to delivery address.",
      step: 2,
    },
    {
      title: "Out for Delivery",
      location: "Local courier · Victoria Island",
      date: addDays(baseDate, 3),
      time: addTime(3),
      desc: "Courier is on the way to your address.",
      step: 2,
    },
    {
      title: "Delivered",
      location: "Customer address",
      date: addDays(baseDate, 4),
      time: addTime(4),
      desc: "Package successfully delivered.",
      step: 3,
    },
  ];
};

const OrderTrackingPage = () => {
  const { user } = useAuth();
  const { createNewConversation, sendMessage } = useMessages();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const API_URL = "http://localhost:5000/api/orders";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/user/${user.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }
        const preOrderDetails = data.find(
          (o) => o.order_item_id === parseInt(id),
        );
        const statusNameChange = (status) => {
          const map = {
            pending_payment: "Pending",
            paid: "Processing",
            shipped: "Shipped",
            delivered: "Delivered",
            cancelled: "Cancelled",
            failed: "Failed",
          };
          return map[status] || status;
        };
        const orderNow = {
          ...preOrderDetails,
          status: statusNameChange(preOrderDetails.status),
        };
        setOrders(orderNow);
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
    fetchOrderDetails();
  }, []);

  const currentStep = statusSteps.findIndex(
    (s) =>
      s.key === (orders.status === "Cancelled" ? "Pending" : orders.status),
  );
  const timeline = useMemo(() => buildTimeline(orders), [orders]);
  const visibleTimeline = timeline.filter((e) => e.step <= currentStep);

  // Map progress: percentage along the route
  const mapProgress = ((currentStep + 1) / statusSteps.length) * 100;

  const copyTracking = () => {
    navigator.clipboard.writeText(`${orders.order_id}`);
    toast({
      title: "Tracking number copied",
      description: "Paste it anywhere to share.",
    });
  };

  const sendConversation = async () => {
    const convo = {
      buyerId: user.id,
      vendorId: orders.vendor_id,
      productId: orders.product_id,
      orderId: orders.order_id,
    };

    const creating = await createNewConversation(convo);

    const formData = new FormData();

    formData.append("conversationId", creating.id);
    formData.append("receiverId", user.id);
    formData.append("senderId", orders.vendor_id);
    formData.append(
      "message",
      `👋 Welcome! Thanks for contacting ${creating.otherUserName}. We're here to help with any questions about your order or our products. Feel free to send us a message, and we'll get back to you as soon as possible.`,
    );

    await sendMessage(formData);

    navigate("/dashboard/messages");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
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
              Track Order
            </h1>
            <p className="text-xs text-muted-foreground">
              Order ID: {orders.order_id}
            </p>
          </div>
        </div>
        <Badge className="bg-primary/15 text-primary border-0 px-3 py-1">
          {orders.status}
        </Badge>
      </div>

      {/* Summary Card */}
      <Card className="border border-border shadow-sm mb-3">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <img
            src={`http://localhost:5000/uploads/products/${orders.thumbnail}`}
            alt={orders.product_name}
            className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{orders.product_name}</p>
            <p className="text-xs text-muted-foreground">
              by {orders.store_name}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="mr-2">Size: {orders.size}</span>
              <span className="mr-2">Color: {orders.color}</span>
              <span className="mr-2">Qty: {orders.quantity}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-heading font-semibold text-foreground">
              ₦{orders.price}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={copyTracking}
              className="rounded-full text-xs border-border mt-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              {orders.order_id}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card className="border border-border shadow-sm mb-3">
        <CardContent className="p-4">
          <div className="relative">
            <div className="flex justify-between relative z-10">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-2 flex-1 px-1"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-xs font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
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
            {/* Progress line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
            <span>
              Estimated delivery:{" "}
              <strong className="text-foreground">{timeline[5].date}</strong>
            </span>
            <span>
              Carrier:{" "}
              <strong className="text-foreground">Fitly Express</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
        {/* Delivery Map */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Map
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live route from vendor to your address
              </p>
            </div>

            {/* Stylized Map */}
            <div className="relative h-72 bg-gradient-to-br from-secondary via-background to-accent/10 overflow-hidden">
              {/* Grid pattern */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Roads */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 280"
                preserveAspectRatio="none"
              >
                <path
                  d="M 40 220 Q 120 200 160 150 T 280 90 Q 320 70 360 60"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 220 Q 120 200 160 150 T 280 90 Q 320 70 360 60"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                  style={{
                    strokeDashoffset: 0,
                    pathLength: 1,
                  }}
                />
                {/* Active progress overlay */}
                <path
                  d="M 40 220 Q 120 200 160 150 T 280 90 Q 320 70 360 60"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray={`${mapProgress} 100`}
                />
              </svg>

              {/* Vendor pin (start) */}
              <div className="absolute" style={{ left: "8%", top: "75%" }}>
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg ring-4 ring-background">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded bg-background/90 backdrop-blur text-[10px] font-medium text-foreground shadow-sm whitespace-nowrap">
                    {orders.store_name}
                  </div>
                </div>
              </div>

              {/* Customer pin (end) */}
              <div className="absolute" style={{ left: "84%", top: "15%" }}>
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-background">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded bg-background/90 backdrop-blur text-[10px] font-medium text-foreground shadow-sm whitespace-nowrap">
                    Your address
                  </div>
                </div>
              </div>

              {/* Courier pin (moving) */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  left: `${8 + (mapProgress / 100) * 76}%`,
                  top: `${75 - (mapProgress / 100) * 60}%`,
                }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-0 h-10 w-10 rounded-full bg-primary/30 animate-ping" />
                  <div className="relative h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl ring-4 ring-background">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-muted-foreground">Distance</p>
                <p className="font-heading font-semibold text-foreground mt-0.5">
                  12.4 km
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-muted-foreground">ETA</p>
                <p className="font-heading font-semibold text-foreground mt-0.5">
                  {orders.status === "Delivered" ? "Delivered" : "~ 2h 15m"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Delivery Timeline
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Detailed activity for your shipment
            </p>

            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-5">
                {visibleTimeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-10">
                    No activity yet.
                  </p>
                ) : (
                  visibleTimeline
                    .slice()
                    .reverse()
                    .map((event, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div
                          className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-background ${
                            idx === 0 ? "bg-primary" : "bg-accent"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              idx === 0
                                ? "bg-primary-foreground"
                                : "bg-accent-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between gap-2">
                          <p className="font-medium text-foreground text-sm">
                            {event.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {event.time}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.location}
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

      {/* Courier Info */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/30 flex items-center justify-center">
              <Truck className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Tunde A.</p>
              <p className="text-xs text-muted-foreground">
                Fitly Express courier · ⭐ 4.9
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border"
            >
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button> */}
            <Button
              size="sm"
              className="rounded-full bg-primary text-primary-foreground"
              onClick={sendConversation}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Message Vendor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Need help? Contact{" "}
        <span className="text-primary font-medium">support@fitly.ng</span>
      </p>
    </div>
  );
};

export default OrderTrackingPage;
