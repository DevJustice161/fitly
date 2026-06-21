const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "store_logo") {
      cb(null, "uploads/logos");
    } else if (file.fieldname === "government_id") {
      cb(null, "uploads/ids");
    } else if (file.fieldname === "cac") {
      cb(null, "uploads/cac");
    } else if (file.fieldname === "product_image") {
      cb(null, "uploads/products");
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"));
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = upload;
