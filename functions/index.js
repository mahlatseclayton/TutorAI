const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { onRequest } = require("firebase-functions/v2/https");

exports.topicTutor = onRequest(
  { secrets: ["GEMINI_API_KEY"] },
  async (req, res) => {

//  used to fix cores issus and allow the function to be called from the frontend ....also in cloud functions turn on permissions for all users to call the function
// make sure the node js versions corresponds to the one in package.json and the one supported by firebase functions and thats how i fixed cores issueafter trying many things
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {

    const userPrompt = req.body?.message;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: "NO_PROMPT_PROVIDED"
      });
    }

    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    return res.status(200).json({
      success: true,
      aiResponse: responseText
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: "AI_GENERATION_FAILED"
    });
  }
});