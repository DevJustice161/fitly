const express = require("express");
const router = express.Router();

const {
  addRecentlyViewed,
  getRecentlyViewed,
  deleteRecentlyViewed,
  clearRecentlyViewed,
} = require("../controllers/recentlyViewedController");

router.post("/", addRecentlyViewed);

router.get("/:userId", getRecentlyViewed);

router.delete("/item/:id", deleteRecentlyViewed);

router.delete("/clear/:userId", clearRecentlyViewed);

module.exports = router;
