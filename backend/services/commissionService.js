exports.calculateCommission = (price) => {
  const commissionRate = 0.1;

  const commission = price * commissionRate;
  const vendorEarning = price - commission;

  return {
    commission,
    vendorEarning,
  };
};
