const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "fitly_db",
  charset: "utf8mb4",
});

module.exports = db.promise();
