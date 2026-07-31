const nodemailer = require("nodemailer");
require("dotenv").config;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Fitly Marketplace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
