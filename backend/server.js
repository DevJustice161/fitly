const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const socket = require("./socket");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/wishlists", require("./routes/wishlistRoutes"));
app.use("/api/reviews", require("./routes/reviewsRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Fitly API Running");
});

const server = http.createServer(app);

socket.init(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
