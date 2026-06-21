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

router.get("/:id", findUser);
router.get("/vendor/:id", findVendor);
router.put("/update/:id", upload.single("avatar"), updateUser);
router.put("/update-password/:id", updateUserPassword);
router.delete("/delete/:id", deleteUser);

module.exports = router;
