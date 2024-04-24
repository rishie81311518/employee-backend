// db.js
const mysql = require("mysql");

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saikiki_2728",
  database: "employee_birthdays_updated",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = db;
