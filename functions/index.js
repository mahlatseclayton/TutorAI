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
    const base64Data = req.body?.image; // data:image/jpeg;base64,... or data:application/pdf;base64,...

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: "NO_PROMPT_PROVIDED"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a highly capable South African science and math tutor. Analyze the provided image or PDF document which contains a question. Provide a clear, accurate, and helpful response based on the requested style (Memo, Teaching, or Step-by-Step). \n\nCRITICAL RULES:\n1. Use LaTeX ($...$) for ALL mathematical expressions.\n2. If a sketch, diagram, or graph is needed, use clear SVG XML code (wrapped in ```html blocks) or highly structured text labels. Avoid messy ASCII art.\n3. Ensure all scientific constants and formulas are accurate."
    });

    let result;
    if (base64Data) {
      console.log("Multimodal request detected (Image/PDF).");
      // Split the base64 string to get the data and MIME type
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image data format");
      }
      const mimeType = matches[1];
      const data = matches[2];

      result = await model.generateContent([
        userPrompt,
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        }
      ]);
    } else {
      console.log("Text-only request detected.");
      result = await model.generateContent(userPrompt);
    }

    const responseText = result.response.text();
    console.log("AI Generation successful.");

    return res.status(200).json({
      success: true,
      aiResponse: responseText
    });

  } catch (error) {
    console.error("CRITICAL AI GENERATION ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "AI_GENERATION_FAILED"
    });
  }
});


//fetches API from cloud,cloud function so have to redeploy and do a regression testing.

const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

exports.YT_VIDEOS = functions.https.onRequest(
  {
    secrets: ["YOUTUBE_API_KEY", "YOUTUBE_API_KEY_2"], // Both secrets
  },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const heading = req.query.heading || "Default Topic";

        // New key first, old key second
        const apiKeys = [
          process.env.YOUTUBE_API_KEY_2, // NEW key first tested
          process.env.YOUTUBE_API_KEY,   // OLD key second
        ];

        let data = null;
        let lastError = null;

        for (const key of apiKeys) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(
                heading
              )}&key=${key}`
            );
            data = await response.json();

            // If quota error, try next key
            if (data.error && data.error.code === 403) {
              lastError = data.error;
              continue;
            }

            // If success, break the loop
            if (!data.error) break;
          } catch (err) {
            lastError = err;
            continue;
          }
        }

        if (!data || data.error) {
          console.error("YouTube API Error:", lastError);
          return res.status(200).json({
            error: true,
            message: "Could not fetch videos. YouTube API quota may be exceeded.",
            videos: [],
          });
        }

        const videos = (data.items || []).map((item) => ({
          id: item.id?.videoId || "",
          title: item.snippet?.title || "Untitled",
        }));

        res.json({ error: false, videos });
      } catch (err) {
        console.error("Error fetching from YouTube API:", err);
        res.status(500).json({
          error: true,
          message: "Failed to fetch videos",
          videos: [],
        });
      }
    });
  }
);