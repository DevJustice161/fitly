const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductsByVendor,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsCard,
  getProductVariants,
  getProductDetails,
} = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadProductImagesMiddleware");

router.get("/", getProducts);

router.get("/productsCard", getProductsCard);

router.get("/vendor/:id", getProductsByVendor);

router.get("/:id", getSingleProduct);

router.get("/details/:slug", getProductDetails);

router.get("/variants/:productId", getProductVariants);

router.put(
  "/update/:id",
  verifyToken,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "gallery",
      maxCount: 20,
    },
  ]),
  updateProduct,
);

router.delete("/delete/:id", verifyToken, deleteProduct);

router.post(
  "/",
  verifyToken,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "gallery",
      maxCount: 20,
    },
  ]),
  createProduct,
);

module.exports = router;
