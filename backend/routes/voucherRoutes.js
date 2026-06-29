const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  getUserVouchers,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
} = require("../controllers/voucherController");

router.post("/", createVoucher);

router.get("/", getAllVouchers);

router.get("/user/:userId", getUserVouchers);

router.get("/:id", getVoucherById);

router.put("/:id", updateVoucher);

router.delete("/:id", deleteVoucher);

router.post("/validate", validateVoucher);

module.exports = router;
