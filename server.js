// server.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB error:', err));

// MongoDB Schema
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // Your Gmail address
    pass: process.env.EMAIL_PASS        // Gmail App Password
  }
});

// Form Submission Route
app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  // Save to MongoDB
  const newMessage = new Message({ name, email, message });
  try {
    await newMessage.save();
    console.log('✅ Message saved to DB');
  } catch (err) {
    console.error('❌ Error saving to DB:', err);
    return res.status(500).send('Database error');
  }

  // Send Email Notification
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // send to yourself
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
