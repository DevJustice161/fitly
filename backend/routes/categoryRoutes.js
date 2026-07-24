const express = require("express");

const router = express.Router();

const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.post("/", verifyToken, createCategory);

module.exports = router;
