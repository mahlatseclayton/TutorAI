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
    secrets: ["SEARLO_API_KEY"],
  },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const heading = req.query.heading || "Default Topic";
        const subject = req.query.subject || "";

        // 🔥 BETTER search query (IMPORTANT)
        const searchQuery = `${heading} ${subject} Grade 12 lesson site:youtube.com`;

        const apiKey = process.env.SEARLO_API_KEY;

        const response = await fetch(
          `https://api.searlo.tech/api/v1/search/web?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        );

        const data = await response.json();

        if (!data || data.success === false) {
          console.error("Searlo API FULL RESPONSE:", JSON.stringify(data, null, 2));
          return res.status(200).json({
            error: true,
            message: "Could not fetch videos from Searlo.",
            videos: [],
          });
        }

        const results = data.organic || [];
        const REQUIRED_VIDEOS = 4;

        // 🎥 Filter YouTube links
        const youtubeResults = results.filter(
          (r) =>
            r.link &&
            (r.link.includes("youtube.com/watch") ||
             r.link.includes("youtu.be/"))
        );

        // 🔧 Extract unique videos
        const videos = [];
        const seen = new Set();

        for (let item of youtubeResults) {
          if (videos.length >= REQUIRED_VIDEOS) break;

          let videoId = "";

          if (item.link.includes("watch?v=")) {
            videoId = item.link.split("watch?v=")[1]?.split("&")[0];
          } else if (item.link.includes("youtu.be/")) {
            videoId = item.link.split("youtu.be/")[1]?.split("?")[0];
          }

          if (videoId && !seen.has(videoId)) {
            seen.add(videoId);
            videos.push({
              id: videoId,
              title: item.title || `${heading} lesson`,
              topic: heading,    
              subject: subject,  
});
          }
        }

        // 🧨 Minimal fallback
        const fallbackVideos = [
          "M7lc1UVf-VE",
          "3JZ_D3ELwOQ",
          "e-ORhEE9VVg",
          "dQw4w9WgXcQ",
        ];

        let i = 0;
        while (videos.length < REQUIRED_VIDEOS && i < fallbackVideos.length) {
          if (!seen.has(fallbackVideos[i])) {
            videos.push({
              id: fallbackVideos[i],
              title: `${heading} lesson`,
            });
          }
          i++;
        }

        // ✂️ Ensure exactly 4
        const finalVideos = videos.slice(0, REQUIRED_VIDEOS);

        res.json({ error: false, videos: finalVideos });

      } catch (err) {
        console.error("Error fetching from Searlo:", err);
        res.status(500).json({
          error: true,
          message: "Failed to fetch videos",
          videos: [],
        });
      }
    });
  }
);