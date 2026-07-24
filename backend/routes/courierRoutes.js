const express = require("express");

const router = express.Router();

const {
  getCouriers,
  createCourier,
  getDefaultCourier,
  updateItemCourier,
} = require("../controllers/courierController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", getCouriers);
router.post("/", verifyToken, createCourier);
router.get("/default", getDefaultCourier);
router.put("/item-change/:id", verifyToken, updateItemCourier);

module.exports = router;
