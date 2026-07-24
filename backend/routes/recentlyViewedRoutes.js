const express = require("express");
const router = express.Router();

const {
  addRecentlyViewed,
  getRecentlyViewed,
  deleteRecentlyViewed,
  clearRecentlyViewed,
} = require("../controllers/recentlyViewedController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, addRecentlyViewed);

router.get("/:userId", getRecentlyViewed);

router.delete("/item/:id", verifyToken, deleteRecentlyViewed);

router.delete("/clear/:userId", verifyToken, clearRecentlyViewed);

module.exports = router;
