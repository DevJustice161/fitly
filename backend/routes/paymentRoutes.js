const express = require("express");

const router = express.Router();

const {
  initializeFlutterwave,
  verifyFlutterwave,
  initializePaystack,
  verifyPaystack,
  initializeTransfer,
  getPaymentMethods,
  addPaymentMethod,
  setDefaultMethod,
  deletePaymentMethod,
} = require("../controllers/paymentController");

router.post("/flutterwave", initializeFlutterwave);

router.get("/flutterwave/verify", verifyFlutterwave);

router.post("/paystack", initializePaystack);

router.get("/paystack/verify", verifyPaystack);

router.post("/transfer", initializeTransfer);

router.get("/get-methods/:userId", getPaymentMethods);

router.post("/method", addPaymentMethod);

router.put("/method/:id", setDefaultMethod);

router.delete("/method/:id", deletePaymentMethod);

module.exports = router;
