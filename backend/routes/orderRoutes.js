const express = require("express");
const router = express.Router();
const {
  createOrder,
  getSingleOrder,
  getUserOrders,
  getOrders,
} = require("../controllers/orderController");

router.get("/", getOrders);

router.get("/:orderId", getSingleOrder);

router.get("/user/:userId", getUserOrders);

router.post("/add", createOrder);

module.exports = router;
