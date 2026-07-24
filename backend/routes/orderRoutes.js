const express = require("express");
const router = express.Router();
const {
  createOrder,
  getSingleOrder,
  getUserOrders,
  getOrders,
  getOrderItems,
  trackOrder,
} = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", getOrders);

router.get("/:orderId", getSingleOrder);

router.get("/track/:orderId", trackOrder);

router.get("/user/:userId", getUserOrders);

router.get("/order-items/:orderId", getOrderItems);

router.post("/add", verifyToken, createOrder);

module.exports = router;
