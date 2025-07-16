const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;

  console.log("New submission:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  // Here you could email it, save to a database, etc.
  res.json({ message: "Your message has been received!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
