const express = require("express");
const router = express.Router();
const {
  getAdminDashboardData,
  getWithdrawalRequests,
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProductStatus,
  deleteProduct,
  getCustomers,
  updateCustomerStatus,
  deleteCustomer,
  getCouriers,
  setDefaultCourier,
  updateCourierStatus,
  updateCourier,
  addCourier,
  deleteCourier,
  getCommissionDetails,
  updateCommissionDetails,
  getReportsAndAnalytics,
} = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/withdrawals-requests", getWithdrawalRequests);
router.get("/customers", getCustomers);
router.get("/orders", getOrders);
router.get("/products", getProducts);
router.get("/couriers", getCouriers);
router.get("/couriers", getCouriers);
router.get("/commission", getCommissionDetails);
router.get("/analytics", getReportsAndAnalytics);
router.get("/:id", getAdminDashboardData);
router.put("/orders/:id/status", verifyToken, updateOrderStatus);
router.put("/products/:id/status", verifyToken, updateProductStatus);
router.put("/customers/:id/status", verifyToken, updateCustomerStatus);
router.put("/couriers/default/:id", verifyToken, setDefaultCourier);
router.put("/couriers/:id/status", verifyToken, updateCourierStatus);
router.put("/couriers/:id", verifyToken, updateCourier);
router.put("/commission", updateCommissionDetails);
router.post("/couriers", verifyToken, addCourier);
router.delete("/couriers/:id", verifyToken, deleteCourier);
router.delete("/products/delete/:id", verifyToken, deleteProduct);
router.delete("/customers/delete/:id", verifyToken, deleteCustomer);
module.exports = router;
