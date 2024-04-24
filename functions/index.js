const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const db = require("./db");
require('dotenv').config();


const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Schedule the job to run daily at midnight
cron.schedule("*/10 * * * * *", () => {
  console.log("Running job...");

  // Execute the query to fetch employees with birthdays today
  const query = `
    SELECT *
    FROM birthdays
    WHERE DATE_FORMAT(emp_birthday, '%m-%d') = DATE_FORMAT(NOW(), '%m-%d');
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }

    // Iterate over the results and send emails
    results.forEach(employee => {
      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.emp_email,
        subject: "Birthday Greetings",
        text: `Dear ${employee.emp_name},\n\nHappy birthday! Wishing you a fantastic day!\n\nBest regards,\nYour Company`
      };

      transporter.sendMail(emailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          return;
        }
        console.log("Email sent successfully:", info.response);
      });
    });
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// POST endpoint to insert employee data
app.post("/employee", (req, res) => {
  const { emp_name, emp_email, emp_birthday } = req.body;

  const sql = "INSERT INTO birthdays (emp_name, emp_email, emp_birthday) VALUES (?, ?, ?)";
  const values = [emp_name, emp_email, emp_birthday];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting employee data:", err);
      res.status(500).json({ error: "Error inserting employee data" });
      return;
    }
    console.log("Employee data inserted successfully");
    res.status(200).json({ message: "Employee data inserted successfully" });
  });
});

// GET endpoint to retrieve employee data
app.get("/employee", (req, res) => {
  const sql = "SELECT * FROM birthdays";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error retrieving employee data:", err);
      res.status(500).json({ error: "Error retrieving employee data" });
      return;
    }
    console.log("Employee data retrieved successfully");
    res.status(200).json(result);
  });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
