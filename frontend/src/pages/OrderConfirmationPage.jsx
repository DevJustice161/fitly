import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { CheckCircle, Package, ArrowRight, Copy, CircleX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { toast } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(price || 0));

const API_URL = "http://localhost:5000/api/orders";

const OrderConfirmationPage = () => {
  const { state } = useLocation();

  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  const [order, setOrder] = useState(state || null);

  const [loading, setLoading] = useState(!state);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (state?.orderId) return;

        setLoading(true);

        const response = await fetch(`${API_URL}/${orderId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order");
        }

        setOrder(data);
      } catch (error) {
        console.error(error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, state]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.order_id);

    toast.success("Order ID copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="section-padding py-20 text-center">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="section-padding py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>

          <p className="text-muted-foreground mb-6">
            {error || "Unable to load order"}
          </p>

          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-padding py-16 max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            {order.status === "failed" ? (
              <CircleX className="h-11 w-11 text-destructive" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
          </div>

          {order.status === "failed" ? (
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Order Failed!
            </h1>
          ) : (
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Order Placed Successfully!
            </h1>
          )}

          <p className="font-body text-muted-foreground">
            {order.status === "failed"
              ? "This order has failed,"
              : "Thank you for shopping with Fitly.ng,"}{" "}
            {order.shipping?.name || "Customer"}!
          </p>
        </div>

        <Card className="border border-border shadow-sm mb-8 text-left">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  Order ID
                </p>

                <p className="font-heading text-lg font-bold text-foreground">
                  {order.order_id}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={copyOrderId}
                className="rounded-full text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <p className="font-body text-xs text-muted-foreground">
                  Total Paid
                </p>

                <p className="font-body text-base font-semibold text-foreground">
                  {formatPrice(order.total)}
                </p>
              </div>

              <div>
                <p className="font-body text-xs text-muted-foreground">
                  Payment Method
                </p>

                <p className="font-body text-base font-semibold text-foreground capitalize">
                  {order.payment_method}
                </p>
              </div>

              <div>
                <p className="font-body text-xs text-muted-foreground">Items</p>

                <p className="font-body text-base font-semibold text-foreground">
                  {order.items?.length || 0} item(s)
                </p>
              </div>

              <div>
                <p className="font-body text-xs text-muted-foreground">
                  Delivery To
                </p>

                <p className="font-body text-base font-semibold text-foreground">
                  {order.shipping?.city || "N/A"},{" "}
                  {order.shipping?.state || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm mb-8 text-left">
          <CardContent className="p-6">
            <h3 className="font-heading text-base font-semibold mb-4">
              Order Items
            </h3>

            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-border pb-4"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>

                    <p className="text-xs text-muted-foreground">
                      {item.size} | {item.color}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>

                    <p className="font-semibold mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm mb-8 text-left">
          <CardContent className="p-6">
            <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              What happens next?
            </h3>

            <div className="space-y-4">
              {[
                {
                  step: "-",
                  title: "Payment Failed",
                  desc: "Payment has not been recieved for order to be placed",
                  active: order.status === "failed",
                },
                {
                  step: "1",
                  title: "Pending Confirmation",
                  desc: "Payment has not been confirmed yet for this order",
                  active: order.status === "pending_payment",
                },
                {
                  step: "2",
                  title: "Order Confirmed",
                  desc: "Your order has been placed and payment received",
                  active: order.status === "paid",
                },

                {
                  step: "3",
                  title: "Vendor Processing",
                  desc: "Vendor is preparing your order",
                  active: order.status === "processing",
                },

                {
                  step: "4",
                  title: "Shipped",
                  desc: "Your order will be shipped soon",
                  active: order.status === "shipped",
                },

                {
                  step: "5",
                  title: "Delivered",
                  desc: "Your order will arrive at your address",
                  active: order.status === "delivered",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      item.active
                        ? order.status === "failed"
                          ? "bg-destructive text-primary-foreground"
                          : "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.step}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.active
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/orders">
            <Button className="rounded-xl px-8">View My Orders</Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="rounded-xl px-8">
              Continue Shopping
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          A confirmation email has been sent to{" "}
          <span className="font-medium text-foreground">
            {order.shipping?.email || "your email"}
          </span>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
