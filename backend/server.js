const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, "../dist")));

// OpenAI API initialization
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in .env file.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API route to handle OpenAI requests
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: chatCompletion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res
      .status(500)
      .json({ error: "Failed to process request. Please try again later." });
  }
});

// Fallback to serve frontend (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
