const db = require("../config/db");

exports.conversionRateCalculation = async () => {
  const [totalUsers] = await db.query(
    "SELECT COUNT(*) AS total_users FROM users",
  );
  const [totalUsersWhoOrdered] = await db.query(
    "SELECT COUNT(DISTINCT user_id) AS total_users_who_ordered FROM orders",
  );

  const totalUsersCount = totalUsers[0]?.total_users || 0;
  const totalUsersWhoOrderedCount =
    totalUsersWhoOrdered[0]?.total_users_who_ordered || 0;

  const conversionRate =
    totalUsersCount > 0
      ? (totalUsersWhoOrderedCount / totalUsersCount) * 100
      : 0;

  return conversionRate.toFixed(2) + "%";
};
