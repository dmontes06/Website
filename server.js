// server.js
require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Flexible Schema (accepts ANY fields)
const messageSchema = new mongoose.Schema({}, { strict: false });
const Message = mongoose.model('Message', messageSchema);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to safely display values
const safe = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "No answer provided";
  }
  return String(value).trim();
};

// Form Submission Route
app.post('/submit', async (req, res) => {
  console.log('📩 Received form data:', req.body);

  // Save all fields to DB
  const newMessage = new Message(req.body);
  try {
    await newMessage.save();
    console.log('✅ Message saved to DB');
  } catch (err) {
    console.error('❌ Error saving to DB:', err);
    return res.status(500).send('Database error');
  }

  // Create HTML table from form data (safe values)
  const emailHTML = `
    <h2>New Form Submission</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
      ${Object.entries(req.body).map(([key, value]) => `
        <tr>
          <td style="font-weight: bold; background: #f4f4f4;">${safe(key)}</td>
          <td>${safe(value)}</td>
        </tr>
      `).join('')}
    </table>
  `;

  // Send HTML email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New form submission from ${safe(req.body.name)}`,
    html: emailHTML
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Email error:', err);
      return res.status(500).send('Email error');
    } else {
      console.log('✅ Email sent:', info.response);
      res.send('Thanks! Your message has been received.');
    }
  });
});

// ✅ MongoDB Connection + Start Server only after success
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => console.error('❌ MongoDB error:', err));
