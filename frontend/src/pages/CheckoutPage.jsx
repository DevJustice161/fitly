import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone,
  Shield,
  ChevronRight,
  MapPin,
  Truck,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotifications } from "../contexts/NotificationContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(price));

const paymentMethods = [
  {
    id: "flutterwave",
    name: "Flutterwave",
    desc: "Pay with card, bank, or mobile money",
    icon: CreditCard,
  },

  {
    id: "paystack",
    name: "Paystack",
    desc: "Debit/credit card & bank transfer",
    icon: Building2,
  },

  {
    id: "transfer",
    name: "Bank Transfer",
    desc: "Direct bank transfer",
    icon: Building2,
  },
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const { triggerNotification } = useNotifications();
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const { items, totalPrice, clearCart } = useCart();

  const [step, setStep] = useState(1);

  const [selectedPayment, setSelectedPayment] = useState("flutterwave");

  const [processing, setProcessing] = useState(false);

  const [shipping, setShipping] = useState([]);

  const deliveryFee = totalPrice >= 50000 ? 0 : 3500;

  const total = totalPrice + deliveryFee;

  const API_URL = "http://localhost:5000/api/users";

  const closeTransferModal = () => {
    setShowTransferModal(false);
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/${user.id}`);

      const data = await response.json();

      const person = data[0];

      setUserDetails({
        name: person.name,
        email: person.email,
        phone: person.phone,
        address: person.address,
        city: person.city,
        state: person.state,
        country: person.country,
      });
      setShipping({
        name: person.name,
        email: person.email,
        phone: person.phone,
        address: person.address,
        city: person.city,
        state: person.state,
        country: person.country,
      });
    } catch (error) {
      console.error("User fetch error:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user?.id]);

  if (!items.length) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="section-padding py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
            No items to checkout
          </h1>

          <p className="font-body text-muted-foreground mb-6">
            Add items to your cart first
          </p>

          <Link to="/" className="btn-gold">
            Continue Shopping
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  const handleShippingChange = (e) => {
    setShipping((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "country",
    ];

    const missing = requiredFields.filter((field) => !shipping[field]?.trim());

    if (missing.length) {
      toast.error("Please fill in all required fields");
      return;
    }

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);

      const payload = {
        tx_ref: `FIT-${Date.now()}`,
        email: shipping.email,
        amount: total,
        name: shipping.name,
        phone: shipping.phone,
      };

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }));

      const order = {
        user_id: user.id,
        status: "pending_payment",
        subtotal: total,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: selectedPayment,
        payment_reference: "",
        order_items: orderItems,
      };

      if (selectedPayment === "flutterwave") {
        const response = await fetch(
          "http://localhost:5000/api/payments/flutterwave",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({ payload: payload, order: order }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        window.location.href = data.link;

        return;
      }

      if (selectedPayment === "paystack") {
        const response = await fetch(
          "http://localhost:5000/api/payments/paystack",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({ payload: payload, order: order }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        window.location.href = data.authorization_url;

        return;
      }

      if (selectedPayment === "transfer") {
        setShowTransferModal(true);
        return;
      }

      if (selectedPayment === "ussd") {
        toast.success("Dial *737*50*Amount# to complete payment");

        return;
      }
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };
  const handleTransferConfirmed = async () => {
    try {
      setProcessing(true);

      const payload = {
        tx_ref: `FIT-${Date.now()}`,
        email: shipping.email,
        amount: total,
        name: shipping.name,
        phone: shipping.phone,
      };

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }));

      const order = {
        user_id: user.id,
        status: "pending_payment",
        subtotal: total,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: selectedPayment,
        payment_reference: "",
        order_items: orderItems,
      };

      const response = await fetch(
        "http://localhost:5000/api/payments/transfer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: payload, order: order }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      closeTransferModal();

      toast.success("Order placed. Awaiting payment verification by admin.");

      navigate(`/order-confirmation?orderId=${payload.tx_ref}`, {
        state: payload.tx_ref,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-padding py-8 mt-4">
        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link
            to="/cart"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Cart
          </Link>

          <ChevronRight size={14} className="text-muted-foreground" />

          <span
            className={
              step >= 1 ? "text-primary font-medium" : "text-muted-foreground"
            }
          >
            Shipping
          </span>

          <ChevronRight size={14} className="text-muted-foreground" />

          <span
            className={
              step >= 2 ? "text-primary font-medium" : "text-muted-foreground"
            }
          >
            Payment
          </span>
        </div>

        <div className="flex items-center gap-0 mb-10 max-w-md">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>

              {s < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="border shadow-sm mb-4">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm mb-1 block">
                          First Name *
                        </label>

                        <input
                          name="name"
                          value={shipping.name}
                          onChange={handleShippingChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm mb-1 block">Email *</label>

                        <input
                          type="email"
                          name="email"
                          value={shipping.email}
                          onChange={handleShippingChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="text-sm mb-1 block">Phone *</label>

                        <input
                          type="tel"
                          name="phone"
                          value={shipping.phone}
                          onChange={handleShippingChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm mb-1 block">Address *</label>

                      <input
                        name="address"
                        value={shipping.address}
                        onChange={handleShippingChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm mb-1 block">City *</label>

                        <input
                          name="city"
                          value={shipping.city}
                          onChange={handleShippingChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="text-sm mb-1 block">State *</label>

                        <input
                          name="state"
                          value={shipping.state}
                          onChange={handleShippingChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="text-sm mb-1 block">Country</label>

                        <input
                          disabled
                          name="country"
                          value={shipping.country}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base rounded-xl"
                    >
                      Continue to Payment
                      <ChevronRight size={18} />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <Card className="border shadow-sm p-4 mb-2">
                  <CardContent className="p-5 ">
                    <div className="flex items-center justify-between ">
                      <div className="flex items-center gap-3 ">
                        <Truck className="h-5 w-5 text-primary" />

                        <div>
                          <p className="text-sm font-medium">Shipping to</p>

                          <p className="text-xs text-muted-foreground">
                            {shipping.name}
                            {" — "}
                            {shipping.address}, {shipping.city},{" "}
                            {shipping.state}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm mb-4">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setSelectedPayment(pm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          selectedPayment === pm.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            selectedPayment === pm.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <pm.icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium">{pm.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {pm.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="w-full h-14 text-base rounded-xl mb-3"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay ${formatPrice(total)}`
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <Shield size={14} />

                  <span className="text-xs">
                    Your payment is secured with 256-bit SSL encryption
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="border shadow-sm mb-4 sticky top-28">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const itemPrice = Number(item.discount_price || item.price);

                    return (
                      <div key={item.cart_id} className="flex gap-3">
                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={`http://localhost:5000/uploads/products/${item.thumbnail}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.name}
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            {item.size} | {item.color}
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity}
                          </p>

                          <p className="text-xs font-semibold">
                            {formatPrice(itemPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>

                    <span className="font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>

                    <span>
                      {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>

                    <span className="text-xl font-bold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={showTransferModal}
          onOpenChange={closeTransferModal}
          onClose={closeTransferModal}
          className="border shadow-sm p-4 mb-2 z-10"
        >
          <DialogContent>
            <div className=" inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <DialogHeader>
                  <DialogTitle>Transfer</DialogTitle>
                  <DialogDescription>
                    <h3 className="text-xl font-semibold mb-4">
                      Bank Transfer Payment
                    </h3>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Bank:</strong> GTBank
                  </p>

                  <p>
                    <strong>Account Name:</strong> Fitly Fashion Ltd
                  </p>

                  <p>
                    <strong>Account Number:</strong> 1234567890
                  </p>

                  <p>
                    <strong>Amount:</strong> {formatPrice(total)}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <Button className="w-full" onClick={handleTransferConfirmed}>
                    I Have Made The Transfer
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowTransferModal(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Your order will remain pending until the transfer is
                  confirmed.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
