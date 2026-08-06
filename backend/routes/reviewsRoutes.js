const express = require("express");
const router = express.Router();
const {
  addToReviews,
  getReviews,
  getHelpfulVotes,
  updateReview,
  deleteReview,
  updateHelpfulCount,
  toggleHelpful,
  updateVisibility,
  replyToReview,
  deleteReviewReply,
} = require("../controllers/reviewsController");

const upload = require("../middleware/uploadReviewsImagesMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

router.post(
  "/add",
  upload.fields([
    {
      name: "gallery",
      maxCount: 5,
    },
  ]),
  verifyToken,
  addToReviews,
);

router.get("/", getReviews);

router.get("/helpful/:id", getHelpfulVotes);

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
  verifyToken,
  updateReview,
);

router.delete("/delete/:id", verifyToken, deleteReview);

router.put("/update-helpful/:revId", verifyToken, updateHelpfulCount);

router.post("/helpful/:id", verifyToken, toggleHelpful);

router.put("/update-visibility/:revId", verifyToken, updateVisibility);

router.post("/reply/:id", verifyToken, replyToReview);

router.delete("/reply/:id", verifyToken, deleteReviewReply);

module.exports = router;
