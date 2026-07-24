const express = require("express");

const router = express.Router();

const {
  initializeFlutterwave,
  verifyFlutterwave,
  initializePaystack,
  verifyPaystack,
  initializeTransfer,
  verifyPremiumFlutterwave,
  verifyPremiumPaystack,
  getPaymentMethods,
  addPaymentMethod,
  setDefaultMethod,
  deletePaymentMethod,
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/flutterwave", verifyToken, initializeFlutterwave);

router.get("/flutterwave/verify", verifyFlutterwave);

router.post("/paystack", verifyToken, initializePaystack);

router.get("/paystack/verify", verifyPaystack);

router.get("/flutterwave/premium/verify", verifyPremiumFlutterwave);

router.get("/paystack/premium/verify", verifyPremiumPaystack);

router.post("/transfer", verifyToken, initializeTransfer);

router.get("/get-methods/:userId", getPaymentMethods);

router.post("/method", verifyToken, addPaymentMethod);

router.put("/method/:id", verifyToken, setDefaultMethod);

router.delete("/method/:id", verifyToken, deletePaymentMethod);

module.exports = router;
