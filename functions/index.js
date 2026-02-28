const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const axios = require("axios");


exports.topicTutor = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
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