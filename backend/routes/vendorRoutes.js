const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  applyVendor,
  getVendorApplications,
  getVendors,
  approveVendor,
  rejectVendor,
  updateVendorStatus,
  getVendorProfile,
} = require("../controllers/vendorController");

router.post(
  "/apply",
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

router.put("/approve/:id", approveVendor);

router.put("/reject/:id", rejectVendor);

router.put("/status/:id", updateVendorStatus);

router.get("/profile/:id", getVendorProfile);
module.exports = router;
