const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getProductLimitForVendor,
  buildSubscriptionPayload,
  buildPremiumPaymentCallbackUrl,
} = require("../utils/premiumUtils");

test("basic vendors are limited to 20 products", () => {
  assert.equal(getProductLimitForVendor(false), 20);
});

test("premium vendors have no product limit", () => {
  assert.equal(getProductLimitForVendor(true), Infinity);
});

test("subscription payload serializes payment and history data", () => {
  const payload = buildSubscriptionPayload({
    vendorId: 42,
    planId: "premium",
    billingCycle: "yearly",
    status: "active",
    autoRenew: true,
    amount: 150000,
    paymentMethod: { type: "card", last4: "4242" },
    history: [{ id: "INV-1", amount: 150000 }],
    startedAt: "2025-01-01T00:00:00.000Z",
    nextBillingAt: "2026-01-01T00:00:00.000Z",
    paymentReference: "ref-123",
  });

  assert.equal(payload.vendor_id, 42);
  assert.equal(payload.plan_id, "premium");
  assert.equal(payload.billing_cycle, "yearly");
  assert.equal(payload.auto_renew, 1);
  assert.equal(payload.amount, 150000);
  assert.equal(typeof payload.payment_method, "string");
  assert.deepEqual(JSON.parse(payload.payment_method), {
    type: "card",
    last4: "4242",
  });
  assert.equal(payload.last_payment_reference, "ref-123");
  assert.equal(payload.status, "active");
});

test("premium payment callback URL includes provider, vendor, and plan details", () => {
  const callback = buildPremiumPaymentCallbackUrl({
    baseUrl: "http://localhost:8080/vendor/premium-payment",
    provider: "flutterwave",
    vendorId: 7,
    planId: "premium",
    billingCycle: "monthly",
    amount: 15000,
    paymentMethod: "flutterwave",
    autoRenew: true,
  });

  assert.match(callback, /purpose=premium/);
  assert.match(callback, /vendorId=7/);
  assert.match(callback, /planId=premium/);
  assert.match(callback, /provider=flutterwave/);
});
