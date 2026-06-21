const express = require("express");
const router = express.Router();
const {
  addToWishLists,
  getWishlists,
  removeWishlistsItem,
  clearWishlists,
} = require("../controllers/wishlistController");

router.get("/:userId", getWishlists);

router.post("/add", addToWishLists);

router.delete("/remove/:id", removeWishlistsItem);

router.delete("/clear/:id", clearWishlists);

module.exports = router;
