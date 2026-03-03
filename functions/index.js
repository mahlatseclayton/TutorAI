const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const axios = require("axios");

exports.topicTutor = functions.https.onRequest(async (req, res) => {

  console.log("🔥 Function triggered");
  console.log("➡ Method:", req.method);
  console.log("➡ Headers:", req.headers);

  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");


// Handle preflight
if (req.method === "OPTIONS") {
  console.log("✅ OPTIONS preflight received");
  return res.status(204).send("");
}

  try {

    console.log("📦 Request Body:", req.body);

    const userPrompt = req.body?.message;

    if (!userPrompt) {
      console.log("❌ No prompt provided");
      return res.status(400).json({ error: "NO_PROMPT_PROVIDED" });
    }

    console.log("💬 User Prompt Received:", userPrompt);

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      console.log("❌ Missing OpenAI API Key");
    }

    console.log("🚀 Sending request to OpenAI...");

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

    console.log("✅ OpenAI Response Received");

    return res.status(200).json({
      success: true,
      aiResponse: response.data.choices?.[0]?.message?.content
    });

  } catch (error) {

    console.error("🔥 ERROR OCCURRED:");
    console.error("Message:", error.message);
    console.error("Response Data:", error.response?.data);
    console.error("Status:", error.response?.status);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});