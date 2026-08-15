const db = require("../config/db");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const getProductLimitForVendor = async (isPremium) => {
  const [defLim] = await db.query(
    "SELECT min_products FROM commission WHERE type = 'default'",
  );

  const defaultLimit = parseInt(defLim[0].min_products);

  return isPremium ? Infinity : defaultLimit;
};

const buildSubscriptionPayload = ({
  vendorId,
  planId,
  billingCycle,
  status,
  autoRenew,
  amount,
  paymentMethod,
  history,
  startedAt,
  nextBillingAt,
  paymentReference,
}) => ({
  vendor_id: vendorId,
  plan_id: planId,
  billing_cycle: billingCycle,
  status,
  auto_renew: autoRenew ? 1 : 0,
  amount,
  payment_method: JSON.stringify(paymentMethod || {}),
  history: JSON.stringify(history || []),
  started_at: startedAt || null,
  next_billing_at: nextBillingAt || null,
  last_payment_reference: paymentReference || null,
});

const buildPremiumPaymentCallbackUrl = ({
  baseUrl,
  provider,
  vendorId,
  planId,
  billingCycle,
  startedAt,
  nextBillingAt,
  paymentReference,
  amount,
  paymentMethod,
  autoRenew,
}) => {
  const url = new URL(baseUrl || `${FRONTEND_URL}/vendor/premium-payment`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("purpose", "premium");
  url.searchParams.set("vendorId", vendorId);
  url.searchParams.set("planId", planId || "premium");
  url.searchParams.set("billingCycle", billingCycle || "monthly");
  url.searchParams.set("startedAt", startedAt);
  url.searchParams.set("nextBillingAt", nextBillingAt);
  url.searchParams.set("paymentReference", paymentReference);
  url.searchParams.set("amount", amount || 0);
  url.searchParams.set("paymentMethod", paymentMethod || "");
  url.searchParams.set("autoRenew", String(Boolean(autoRenew)));
  return url.toString();
};

module.exports = {
  getProductLimitForVendor,
  buildSubscriptionPayload,
  buildPremiumPaymentCallbackUrl,
};
