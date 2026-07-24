const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  getUserVouchers,
  getVendorVouchers,
  updateVoucher,
  toggleActive,
  deleteVoucher,
  validateVoucher,
} = require("../controllers/voucherController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createVoucher);

router.get("/", getAllVouchers);

router.get("/user/:userId", getUserVouchers);

router.get("/vendor/:vendorId", getVendorVouchers);

router.get("/:id", getVoucherById);

router.put("/:id", verifyToken, updateVoucher);

router.put("/toggle/:id", verifyToken, toggleActive);

router.delete("/:id", verifyToken, deleteVoucher);

router.post("/validate", verifyToken, validateVoucher);

module.exports = router;
