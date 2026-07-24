const express = require("express");
const router = express.Router();
const {
  findUser,
  findVendor,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/userController");

const upload = require("../middleware/uploadAvatarsMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:id", findUser);
router.get("/vendor/:id", findVendor);
router.put("/update/:id", verifyToken, upload.single("avatar"), updateUser);
router.put("/update-password/:id", verifyToken, updateUserPassword);
router.delete("/delete/:id", verifyToken, deleteUser);

module.exports = router;
