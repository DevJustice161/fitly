import { useState, useEffect, useMemo } from "react";
import {
  Crown,
  Check,
  BadgeCheck,
  TrendingUp,
  Star,
  Zap,
  CreditCard,
  Calendar,
  Receipt,
  XCircle,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useSiteDetails } from "@/contexts/SiteContext.jsx";

const STORAGE_KEY = "fitly_vendor_premium";

const VendorPremium = () => {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const { siteDetails } = useSiteDetails();
  const currencySymbol = siteDetails?.currencySymbol || "₦";
  const API_URL = import.meta.env.VITE_API_URL;

  const defaultState = {
    planId: "basic",
    billingCycle: "monthly",
    autoRenew: true,
    startedAt: null,
    nextBillingAt: null,
    paymentMethod: null,
    history: [], //
    rates: [],
  };

  const [state, setState] = useState(defaultState);

  const [cycle, setCycle] = useState(state.billingCycle || "monthly");
  const [payOpen, setPayOpen] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [payForm, setPayForm] = useState({
    method: "flutterwave",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;

      try {
        setLoadingSubscription(true);
        const response = await fetch(`${API_URL}/vendors/premium/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch subscription status",
          );
        }

        setState((prev) => ({
          ...prev,
          planId: data.is_premium ? "premium" : "basic",
          billingCycle: data.billing_cycle || prev.billingCycle || "monthly",
          autoRenew: data.auto_renew ?? prev.autoRenew,
          startedAt: data.started_at || prev.startedAt,
          nextBillingAt: data.next_billing_at || prev.nextBillingAt,
          paymentMethod: data.payment_method || prev.paymentMethod,
          history: data.history || prev.history,
          rates: data.rates,
        }));
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user?.id]);

  const basic_commission = state?.rates.find((rate) => rate.type == "default");

  const premium_commission = state?.rates.find(
    (rate) => rate.type == "premium",
  );

  const PLAN_DEFS = {
    basic: {
      id: "basic",
      name: "Basic Vendor",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        `List up to ${basic_commission?.minProducts} products`,
        "Standard search ranking",
        "Basic analytics",
        "Email support",
        `${basic_commission?.value}% commission per sale`,
      ],
    },
    premium: {
      id: "premium",
      name: "Premium Vendor",
      priceMonthly: parseInt(premium_commission?.price),
      priceYearly: parseInt(premium_commission?.price * 10), // 2 months free
      features: [
        "Unlimited products",
        "Higher search ranking",
        "Featured on homepage",
        "Priority product visibility",
        "Verified vendor badge",
        "Advanced analytics",
        "Priority support",
        `Reduced commission (${premium_commission?.value}%)`,
      ],
      popular: true,
    },
  };

  const fmt = (n) => `${currencySymbol}${n.toLocaleString()}`;
  const addDays = (d, days) => new Date(d.getTime() + days * 86400000);

  const isPremium = state.planId === "premium";
  const currentPlan = PLAN_DEFS[state.planId];

  const daysRemaining = useMemo(() => {
    if (!state.nextBillingAt) return 0;
    const diff = new Date(state.nextBillingAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [state.nextBillingAt]);

  const cycleDays = state.billingCycle === "yearly" ? 365 : 30;
  const usedPct = state.startedAt
    ? Math.min(100, Math.round(((cycleDays - daysRemaining) / cycleDays) * 100))
    : 0;

  const openCheckout = (planId) => {
    if (planId === "basic") {
      // Downgrade path
      setCancelOpen(true);
      return;
    }
    if (isPremium) {
      toast({
        title: "Already subscribed",
        description: "You are on the Premium plan.",
      });
      return;
    }
    setPendingPlan(planId);
    setPayOpen(true);
  };

  const validatePayment = () => {
    if (payForm.method === "card") {
      const digits = payForm.cardNumber.replace(/\s/g, "");
      if (!payForm.cardName.trim()) return "Enter cardholder name";
      if (digits.length < 13 || digits.length > 19)
        return "Enter a valid card number";
      if (!/^\d{2}\/\d{2}$/.test(payForm.expiry)) return "Expiry must be MM/YY";
      if (!/^\d{3,4}$/.test(payForm.cvv)) return "Invalid CVV";
    }
    return null;
  };

  const handlePay = async () => {
    const err = validatePayment();
    if (err) {
      toast({
        title: "Payment error",
        description: err,
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Unable to update subscription",
        description: "Please sign in again and try again.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const plan = PLAN_DEFS[pendingPlan];
      const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
      const now = new Date();
      const next = addDays(now, cycle === "yearly" ? 365 : 30);
      const digits = payForm.cardNumber.replace(/\s/g, "");
      const method =
        payForm.method === "card"
          ? {
              type: "card",
              last4: digits.slice(-4),
              brand: digits.startsWith("4") ? "Visa" : "Mastercard",
            }
          : { type: payForm.method };

      const response = await fetch(`${API_URL}/vendors/premium/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isPremium: true,
          planId: plan.id,
          billingCycle: cycle,
          autoRenew: true,
          amount,
          paymentMethod: method,
          history: [
            {
              id: `INV-${Date.now()}`,
              date: now.toISOString(),
              amount,
              plan: plan.name,
              status: "Pending",
              method: method.type,
            },
            ...state.history,
          ],
          startedAt: now.toISOString(),
          nextBillingAt: next.toISOString(),
          paymentReference: `TX-${Date.now()}`,
          status: "pending",
          provider: payForm.method === "card" ? "flutterwave" : payForm.method,
          email: user?.email || "vendor@fitly.app",
          name: user?.name || user?.full_name || "Vendor",
          phone: user?.phone || "00000000000",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to activate premium");
      }

      if (data.redirect_url) {
        window.open(data.redirect_url, "noopener,noreferrer");
      }

      setState((s) => ({
        ...s,
        planId: plan.id,
        billingCycle: cycle,
        autoRenew: true,
        startedAt: now.toISOString(),
        nextBillingAt: next.toISOString(),
        paymentMethod: method,
        history: [
          {
            id: `INV-${Date.now()}`,
            date: now.toISOString(),
            amount,
            plan: plan.name,
            status: data.redirect_url ? "Pending" : "Paid",
            method: method.type,
          },
          ...s.history,
        ],
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vendor-profile-updated", {
            detail: { is_premium: data.redirect_url ? false : true },
          }),
        );
      }
      setPayOpen(false);
      setPendingPlan(null);
      setPayForm({
        method: "flutterwave",
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
      });
      toast({
        title: "Welcome to Premium 🎉",
        description: `Your ${plan.name} subscription is active until ${next.toDateString()}.`,
      });
    } catch (error) {
      console.error("Error activating premium:", error);
      toast({
        title: "Subscription update failed",
        description: error.message || "Could not activate premium right now.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!user?.id) {
      toast({
        title: "Unable to update subscription",
        description: "Please sign in again and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vendors/premium/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isPremium: false,
          planId: "basic",
          billingCycle: state.billingCycle || cycle,
          autoRenew: false,
          amount: 0,
          paymentMethod: null,
          history: state.history,
          startedAt: null,
          nextBillingAt: null,
          paymentReference: null,
          status: "cancelled",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel premium");
      }

      setState((s) => ({
        ...s,
        planId: "basic",
        autoRenew: false,
        startedAt: null,
        nextBillingAt: null,
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vendor-profile-updated", {
            detail: { is_premium: false },
          }),
        );
      }
      setCancelOpen(false);
      toast({
        title: "Subscription cancelled",
        description: "You have been moved to the Basic plan.",
      });
    } catch (error) {
      console.error("Error cancelling premium:", error);
      toast({
        title: "Subscription update failed",
        description: error.message || "Could not cancel premium right now.",
        variant: "destructive",
      });
    }
  };

  const toggleAutoRenew = async (v) => {
    if (!user?.id) {
      toast({
        title: "Unable to update subscription",
        description: "Please sign in again and try again.",
        variant: "destructive",
      });
      return;
    }

    const nextState = { ...state, autoRenew: v };
    setState(nextState);

    try {
      const response = await fetch(`${API_URL}/vendors/premium/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isPremium: nextState.planId === "premium",
          planId: nextState.planId,
          billingCycle: nextState.billingCycle || cycle,
          autoRenew: v,
          amount: nextState.amount ?? 0,
          paymentMethod: nextState.paymentMethod ?? null,
          history: nextState.history ?? [],
          startedAt: nextState.startedAt ?? null,
          nextBillingAt: nextState.nextBillingAt ?? null,
          paymentReference: nextState.paymentReference ?? null,
          status: nextState.planId === "premium" ? "active" : "cancelled",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update auto-renew");
      }

      toast({ title: v ? "Auto-renew enabled" : "Auto-renew disabled" });
    } catch (error) {
      console.error("Error updating auto-renew:", error);
      setState((s) => ({ ...s, autoRenew: !v }));
      toast({
        title: "Auto-renew update failed",
        description: error.message || "Could not update auto-renew right now.",
        variant: "destructive",
      });
    }
  };

  const formatCardNumber = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" /> Premium Subscription
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Boost your visibility, unlock advanced tools, and pay less
            commission.
          </p>
        </div>
        {loadingSubscription ? (
          <Badge variant="secondary" className="w-fit">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
          </Badge>
        ) : isPremium ? (
          <Badge className="bg-primary text-primary-foreground w-fit">
            <Sparkles className="h-3 w-3 mr-1" /> Premium Active
          </Badge>
        ) : null}
      </div>

      {/* Current subscription overview (only when premium) */}
      {isPremium && (
        <Card className="mb-6 border-primary/40 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Current Plan
                </CardTitle>
                <CardDescription>
                  {currentPlan.name} ·{" "}
                  {state.billingCycle === "yearly" ? "Yearly" : "Monthly"}{" "}
                  billing
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="auto-renew"
                  className="text-xs text-muted-foreground"
                >
                  Auto-renew
                </Label>
                <Switch
                  id="auto-renew"
                  checked={state.autoRenew}
                  onCheckedChange={toggleAutoRenew}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Renews in
                </p>
                <p className="text-xl font-heading font-semibold">
                  {daysRemaining} {daysRemaining <= 1 ? "day" : "days"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Next charge
                </p>
                <p className="text-sm font-medium mt-1">
                  {state.nextBillingAt
                    ? new Date(state.nextBillingAt).toLocaleDateString(
                        "en-NG",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )
                    : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Amount
                </p>
                <p className="text-sm font-medium mt-1">
                  {fmt(
                    state.billingCycle === "yearly"
                      ? PLAN_DEFS.premium.priceYearly
                      : PLAN_DEFS.premium.priceMonthly,
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Payment
                </p>
                <p className="text-sm font-medium mt-1 capitalize">
                  {state.paymentMethod?.type === "card"
                    ? `${state.paymentMethod.brand} ••${state.paymentMethod.last4}`
                    : state.paymentMethod?.type || "—"}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Cycle progress</span>
                <span>{usedPct}%</span>
              </div>
              <Progress value={usedPct} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayOpen(true) || setPendingPlan("premium")}
              >
                <CreditCard className="h-4 w-4" /> Update payment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="h-4 w-4" /> Cancel subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-4">
        <Tabs value={cycle} onValueChange={setCycle} className="w-fit">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              <span className="mr-2">Yearly</span>
              <Badge variant="secondary" className="ml-4 text-[10px]">
                Save 17%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {Object.values(PLAN_DEFS).map((plan) => {
          const price =
            cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          const isCurrent = state.planId === plan.id;
          return (
            <Card
              key={plan.id}
              className={`p-2 border shadow-sm relative ${plan.popular ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Crown className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="font-heading text-xl">
                  {plan.name}
                </CardTitle>
                <p className="text-3xl font-heading font-bold text-foreground mt-2">
                  {price === 0 ? "Free" : fmt(price)}
                  {price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{cycle === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={isCurrent}
                  className={`w-full ${plan.popular && !isCurrent ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  variant={
                    isCurrent
                      ? "outline"
                      : plan.popular
                        ? "default"
                        : "secondary"
                  }
                  onClick={() => openCheckout(plan.id)}
                >
                  {isCurrent
                    ? "Current Plan"
                    : plan.id === "basic"
                      ? "Downgrade"
                      : isPremium
                        ? "Manage"
                        : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <Card className="border border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Premium Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: TrendingUp,
                title: "Higher Rankings",
                desc: "Your products appear first in search results",
              },
              {
                icon: Star,
                title: "Homepage Featured",
                desc: "Get showcased in the featured vendors section",
              },
              {
                icon: BadgeCheck,
                title: "Verified Badge",
                desc: "Build trust with the verified vendor badge",
              },
              {
                icon: Zap,
                title: "Lower Commission",
                desc: `Pay only ${premium_commission?.value}% commission instead of ${basic_commission?.value}%`,
              },
            ].map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <b.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {b.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Billing History
          </CardTitle>
          <CardDescription>
            Your recent premium invoices and payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.history.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y">
              {state.history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{h.plan}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {h.id} · <span className="capitalize">{h.method}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{fmt(Number(h.amount))}</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 hover:bg-green-100"
                    >
                      {h.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={payOpen}
        onOpenChange={(o) => {
          if (!processing) setPayOpen(o);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Complete Payment</DialogTitle>
            <DialogDescription>
              {pendingPlan && (
                <>
                  {PLAN_DEFS[pendingPlan]?.name} —{" "}
                  <span className="font-semibold text-foreground">
                    {fmt(
                      cycle === "yearly"
                        ? PLAN_DEFS[pendingPlan].priceYearly
                        : PLAN_DEFS[pendingPlan].priceMonthly,
                    )}
                  </span>{" "}
                  / {cycle === "yearly" ? "year" : "month"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Payment Method
              </Label>
              <RadioGroup
                value={payForm.method}
                onValueChange={(v) => setPayForm((f) => ({ ...f, method: v }))}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {["flutterwave", "paystack", "card"].map((m) => (
                  <Label
                    key={m}
                    htmlFor={`pm-${m}`}
                    className={`border rounded-md p-2 flex flex-col items-center gap-1 cursor-pointer text-xs capitalize ${
                      payForm.method === m
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem
                      id={`pm-${m}`}
                      value={m}
                      className="sr-only"
                    />
                    <CreditCard className="h-4 w-4" /> {m}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {payForm.method === "card" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardName">Cardholder name</Label>
                  <Input
                    id="cardName"
                    value={payForm.cardName}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, cardName: e.target.value }))
                    }
                    placeholder="Amara Johnson"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card number</Label>
                  <Input
                    id="cardNumber"
                    value={payForm.cardNumber}
                    onChange={(e) =>
                      setPayForm((f) => ({
                        ...f,
                        cardNumber: formatCardNumber(e.target.value),
                      }))
                    }
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                    <Input
                      id="expiry"
                      value={payForm.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setPayForm((f) => ({ ...f, expiry: v }));
                      }}
                      placeholder="12/27"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={payForm.cvv}
                      onChange={(e) =>
                        setPayForm((f) => ({
                          ...f,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {payForm.method !== "card" && (
              <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
                You'll be redirected to{" "}
                <span className="capitalize font-medium text-foreground">
                  {payForm.method}
                </span>{" "}
                to complete the payment securely.
              </div>
            )}

            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total due today</span>
              <span className="font-semibold">
                {pendingPlan
                  ? fmt(
                      cycle === "yearly"
                        ? PLAN_DEFS[pendingPlan].priceYearly
                        : PLAN_DEFS[pendingPlan].priceMonthly,
                    )
                  : "—"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={processing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>Pay Now</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Premium subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll lose premium benefits immediately: featured placement,
              verified badge, unlimited listings, and the reduced{" "}
              {premium_commission?.value}% commission rate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Premium</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorPremium;
