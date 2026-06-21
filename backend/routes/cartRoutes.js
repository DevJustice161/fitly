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

router.get("/:userId", getCart);

router.post("/add", addToCart);

router.put("/update/:id", updateCartItem);

router.delete("/remove/:id", removeCartItem);

router.delete("/clear/:id", clearCart);

router.put("/variant/:cartId", updateCartVariant);

module.exports = router;
