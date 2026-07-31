const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSiteSettings,
  updateTaxSettings,
  updateShippingSettings,
  updateMaintenanceSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  changeAdminPassword,
  updateSiteLogo,
} = require("../controllers/siteController");

const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadSiteLogoMiddleware");

router.get("/", verifyToken, getSettings);

router.put("/site", verifyToken, updateSiteSettings);
router.put("/site/logo", verifyToken, upload.single("logo"), updateSiteLogo);

router.put("/tax", verifyToken, updateTaxSettings);
router.put("/shipping", verifyToken, updateShippingSettings);
router.put("/maintenance", verifyToken, updateMaintenanceSettings);
router.put("/notifications", verifyToken, updateNotificationSettings);
router.put("/security", verifyToken, updateSecuritySettings);

router.put("/change-password", verifyToken, changeAdminPassword);

module.exports = router;
