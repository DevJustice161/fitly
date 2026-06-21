const express = require("express");
const router = express.Router();
const {
  addToReviews,
  getReviews,
  updateReview,
  deleteReview,
  updateHelpfulCount,
} = require("../controllers/reviewsController");

const upload = require("../middleware/uploadReviewsImagesMiddleware");

router.post(
  "/add",
  upload.fields([
    {
      name: "gallery",
      maxCount: 5,
    },
  ]),
  addToReviews,
);

router.get("/", getReviews);

router.put(
  "/update/:id",
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
  updateReview,
);

router.delete("/delete/:id", deleteReview);

router.put("/update-helpful/:revId", updateHelpfulCount);

module.exports = router;
