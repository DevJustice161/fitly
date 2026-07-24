const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
  clearCart,
  updateCartVariant,
} = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:userId", getCart);

router.post("/add", verifyToken, addToCart);

router.put("/update/:id", verifyToken, updateCartItem);

router.delete("/remove/:id", verifyToken, removeCartItem);

router.delete("/clear/:id", verifyToken, clearCart);

router.put("/variant/:cartId", verifyToken, updateCartVariant);

module.exports = router;
