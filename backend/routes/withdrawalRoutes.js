const express = require("express");

const router = express.Router();

const {
  getWithdrawals,
  initiateWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
} = require("../controllers/withdrawalController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:vendorId", getWithdrawals);
router.post("/", verifyToken, initiateWithdrawal);
router.put("/approve/:id", verifyToken, approveWithdrawal);
router.put("/reject/:id", verifyToken, rejectWithdrawal);

module.exports = router;
