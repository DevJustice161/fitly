const express = require("express");

const router = express.Router();

const {
  getWithdrawals,
  initiateWithdrawal,
} = require("../controllers/withdrawalController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:vendorId", getWithdrawals);
router.post("/", verifyToken, initiateWithdrawal);

module.exports = router;
