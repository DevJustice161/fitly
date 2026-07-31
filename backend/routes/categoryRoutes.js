const express = require("express");

const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryImage,
  updateCategoryStatus,
  deleteCategory,
} = require("../controllers/categoryController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadCategoryImagesMiddleware");

router.get("/", getCategories);
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);
router.put(
  "/:id/image",
  verifyToken,
  upload.single("image"),
  updateCategoryImage,
);
router.put("/:id/status", verifyToken, updateCategoryStatus);
router.delete("/:id", verifyToken, deleteCategory);

module.exports = router;
