const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const fs = require("fs");
const path = require("path");

exports.addToReviews = async (req, res) => {
  try {
    const { userId, productId, orderItemId, helpful, title, review, rating } =
      req.body;

    const gallery = req.files?.gallery || [];

    const [existing] = await db.query(
      `
      SELECT * FROM reviews
      WHERE user_id = ?
      AND product_id = ?
      `,
      [userId, productId],
    );

    const [vendorDetails] = await db.query(
      `SELECT vendor_id, name from products where id = ?`,
      [productId],
    );
    const [userDetails] = await db.query(
      `SELECT name from users where id = ?`,
      [userId],
    );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE reviews
        SET review = ?
        WHERE id = ?
        `,
        [review, existing[0].id],
      );

      return res.status(200).json({
        success: true,
        message: "Review updated",
      });
    }

    const [reviewResult] = await db.query(
      `
      INSERT INTO reviews(
        user_id,
        product_id,
        order_item_id,
        rating, title, review, helpful
      )
      VALUES(?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, productId, orderItemId, rating, title, review, helpful],
    );
    const reviewId = reviewResult.insertId;

    for (const image of gallery) {
      await db.query(
        `
            INSERT INTO review_images (
              review_id,
              user_id,
              product_id,
              image_url
            )
            VALUES (?, ?, ?, ?)
            `,
        [reviewId, userId, productId, image.filename],
      );
    }
    await createNotification({
      userId: vendorDetails[0].vendor_id,
      type: "review",
      title: "New Review",
      message: `${userDetails[0].name} reviewed your product, ${vendorDetails[0].name}.`,
      referenceId: reviewId,
    });

    res.status(201).json({
      success: true,
      message: "Added to reviews",
    });
  } catch (error) {
    console.error("Add to reviews error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT
        rv.id,
        rv.rating,
        rv.title,
        rv.review,
        rv.helpful,
        rv.order_item_id,
        rv.created_at,
        rv.updated_at,
        rv.product_id AS productId,
        rv.user_id AS userId,

        u.name AS userName,
        u.avatar AS userAvatar,

        rp.reply,
        rp.created_at AS replyDate,
        rp.updated_at AS replyUpdatedDate

      FROM reviews rv
      JOIN users u ON u.id = rv.user_id
      LEFT JOIN review_replies rp ON rp.review_id = rv.id
    `);

    if (!items.length) return res.json([]);

    const reviewIds = items.map((r) => r.id);

    const placeholders = reviewIds.map(() => "?").join(",");

    const [images] = await db.query(
      `SELECT * FROM review_images WHERE review_id IN (${placeholders})`,
      reviewIds,
    );

    const [replies] = await db.query(
      `SELECT * from review_replies WHERE review_id IN (${placeholders})`,
      reviewIds,
    );

    const reviewImages = {};
    const reviewReplies = {};

    images.forEach((img) => {
      if (!reviewImages[img.review_id]) {
        reviewImages[img.review_id] = [];
      }
      reviewImages[img.review_id].push(img.image_url);
    });

    replies.forEach((rep) => {
      if (!reviewReplies[rep.review_id]) {
        reviewReplies[rep.review_id] = [];
      }
      reviewReplies[rep.review_id].push(rep);
    });

    const reviewsWithImages = items.map((review) => ({
      ...review,
      images: reviewImages[review.id] || [],
      replies: reviewReplies[review.id] || [],
    }));

    res.json(reviewsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

exports.updateReview = async (req, res) => {
  const { id } = req.params;
  try {
    const { userId, productId, rating, title, review, images } = req.body;
    const gallery = req.files?.gallery || [];

    const [reviewRows] = await db.query("SELECT * FROM reviews WHERE id = ?", [
      id,
    ]);
    if (reviewRows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const theReview = reviewRows[0];

    await db.query(
      `
        UPDATE reviews
        SET
          rating = ?,
          title = ?,
          review = ?
        WHERE id = ?
        `,
      [rating, title, review, id],
    );

    const remainingImages = images ? JSON.parse(images) : [];

    const [currentImages] = await db.query(
      "SELECT * FROM review_images WHERE review_id = ?",
      [id],
    );

    const imagesToDelete = currentImages.filter(
      (img) => !remainingImages.includes(img.image_url),
    );

    for (const img of imagesToDelete) {
      const imgPath = path.join(__dirname, "../uploads/reviews", img.image_url);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }

      await db.query("DELETE FROM review_images WHERE id = ?", [img.id]);
    }

    if (req.files?.gallery) {
      for (const image of req.files.gallery) {
        await db.query(
          "INSERT INTO review_images (user_id, product_id, review_id, image_url) VALUES (?, ?, ?, ?)",
          [userId, productId, id, image.filename],
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review" });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const [review] = await db.query("SELECT * FROM reviews WHERE id = ?", [id]);
    const [images] = await db.query(
      "SELECT * FROM review_images WHERE review_id = ?",
      [id],
    );
    if (review.length === 0) {
      return res.status(404).json({ message: "review not found" });
    }
    const reviewData = review[0];

    images.forEach((img) => {
      const imgPath = path.join(__dirname, "../uploads/reviews", img.image_url);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
    await db.query("DELETE FROM review_images WHERE review_id = ?", [id]);
    await db.query("DELETE FROM reviews WHERE id = ?", [id]);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

exports.updateHelpfulCount = async (req, res) => {
  const { revId } = req.params;
  try {
    const { arithmetic } = req.body;

    const [reviewRows] = await db.query("SELECT * FROM reviews WHERE id = ?", [
      revId,
    ]);

    const [productRows] = await db.query(
      "SELECT name FROM products WHERE id = ?",
      [reviewRows[0].product_id],
    );

    const [userRows] = await db.query("SELECT name FROM users WHERE id = ?", [
      reviewRows[0].user_id,
    ]);
    if (reviewRows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const theReviewCount = reviewRows[0].helpful;

    const helpful =
      arithmetic === "add" ? theReviewCount + 1 : theReviewCount - 1;

    await db.query(
      `
        UPDATE reviews
        SET
          helpful = ?
        WHERE id = ?
        `,
      [helpful, revId],
    );

    if (arithmetic === "add") {
      await createNotification({
        userId: reviewRows[0].user_id,
        type: "review",
        title: "Review Found Helpful",
        message: `${userRows[0].name} found your product helpful, You now have ${helpful} likes for your review on ${productRows[0].name}.`,
        referenceId: revId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review" });
  }
};
