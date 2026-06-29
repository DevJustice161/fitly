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

router.get("/", getOrders);

router.get("/:orderId", getSingleOrder);

router.get("/track/:orderId", trackOrder);

router.get("/user/:userId", getUserOrders);

router.get("/order-items/:orderId", getOrderItems);

router.post("/add", createOrder);

module.exports = router;
