const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const uploadAvatar = require("../middleware/uploadAvatarsMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

const {
  applyVendor,
  getVendorApplications,
  getVendors,
  approveVendor,
  rejectVendor,
  updateVendorStatus,
  getVendorPremiumStatus,
  updateVendorPremium,
  updateVendorProfile,
  getVendorProfile,
  getVendorDashboard,
  getVendorCustomers,
  getOrders,
  updateOrderStatus,
} = require("../controllers/vendorController");
const { verify } = require("jsonwebtoken");

router.post(
  "/apply",
  verifyToken,
  upload.fields([
    {
      name: "store_logo",
      maxCount: 1,
    },
    {
      name: "government_id",
      maxCount: 1,
    },
  ]),
  applyVendor,
);

router.get("/applications", getVendorApplications);

router.get("/vendors", getVendors);

router.put("/approve/:id", verifyToken, approveVendor);

router.put("/reject/:id", verifyToken, rejectVendor);

router.put("/status/:id", verifyToken, updateVendorStatus);
router.get("/premium/:id", getVendorPremiumStatus);
router.put("/premium/:id", verifyToken, updateVendorPremium);

router.put(
  "/profile/:id",
  verifyToken,
  uploadAvatar.single("store_logo"),
  updateVendorProfile,
);
router.get("/profile/:id", getVendorProfile);

router.get("/dashboard/:userId", getVendorDashboard);

router.get("/customers/:vendorId", getVendorCustomers);

router.get("/orders/:vendorId", getOrders);

router.put("/orders/status/:id", verifyToken, updateOrderStatus);
module.exports = router;
