const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the dist folder (for frontend)
app.use(express.static(path.join(__dirname, "../dist")));

// Check for missing API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in .env file.");
  process.exit(1); // Exit if API key is missing
}

// OpenAI configuration
let configuration;
try {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error("Error initializing OpenAI Configuration:", error.message);
  process.exit(1); // Exit if initialization fails
}

const openai = new OpenAIApi(configuration);

// API route to handle OpenAI requests
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
    });

    res.json({ result: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error(
      "Error with OpenAI API:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to process request. Check server logs for more details.",
    });
  }
});

// Fallback to serve frontend (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start the server
const PORT = process.env.PORT || 8080; // Ensure this matches the Azure default port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
