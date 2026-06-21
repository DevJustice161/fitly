const express = require("express");

const router = express.Router();

const {
  initializeFlutterwave,
  verifyFlutterwave,
  initializePaystack,
  verifyPaystack,
  initializeTransfer,
} = require("../controllers/paymentController");

router.post("/flutterwave", initializeFlutterwave);

router.get("/flutterwave/verify", verifyFlutterwave);

router.post("/paystack", initializePaystack);

router.get("/paystack/verify", verifyPaystack);

router.post("/transfer", initializeTransfer);

module.exports = router;
