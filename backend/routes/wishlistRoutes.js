const express = require("express");
const router = express.Router();
const {
  addToWishLists,
  getWishlists,
  removeWishlistsItem,
  clearWishlists,
} = require("../controllers/wishlistController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:userId", getWishlists);

router.post("/add", verifyToken, addToWishLists);

router.delete("/remove/:id", verifyToken, removeWishlistsItem);

router.delete("/clear/:id", verifyToken, clearWishlists);

module.exports = router;
