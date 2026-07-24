const db = require("../config/db");

exports.calculateCommission = async (price, type) => {
  const [allRatesResults] = await db.query("SELECT * FROM commission");

  const [defaultRateResult] = await db.query(
    "SELECT commission_rate FROM commission WHERE type = 'default' LIMIT 1",
  );

  const [premiumRateResult] = await db.query(
    "SELECT commission_rate FROM commission WHERE type = 'premium' LIMIT 1",
  );

  const allRates = allRatesResults.map((rate) => ({
    type: rate.type,
    price: rate.price,
    minProducts: rate.min_products,
    value: rate.commission_rate,
  }));

  const commissionRate =
    type === "premium"
      ? premiumRateResult[0]?.commission_rate / 100
      : defaultRateResult[0]?.commission_rate / 100 || 0.1;

  const commission = price * commissionRate;
  const vendorEarning = price - commission;
  const commissionPercentage = commissionRate * 100 + "%";
  const netBalance = vendorEarning - commission;
  const commissionDetails = {
    commissionRate: commissionRate,
    commissionPercentage: commissionPercentage,
    commissionDeducted: commission,
    totalEarnings: vendorEarning,
    netBalance: netBalance,
    allRates: allRates,
  };

  return commissionDetails;
};
