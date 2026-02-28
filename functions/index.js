const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const axios = require("axios");
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));

// Parse JSON bodies
app.use(express.json());

// Your endpoint
app.post('/', async (req, res) => {
  try {
    const userPrompt = req.body.message;

    if (!userPrompt) {
      return res.status(400).json({
        error: "NO_PROMPT_PROVIDED"
      });
    }

    const apiKey = process.env.OPENAI_KEY;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      aiResponse: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export the Express app as a Firebase Function
exports.topicTutor = functions.https.onRequest(app);