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


//fetches API from cloud

const cors = require("cors")({ origin: true });
exports.YT_VIDEOS = functions.https.onRequest(
  {
    secrets: ["YOUTUBE_API_KEY"],
  },
  (req, res) => {
    cors(req, res, async () => {  // wrap your code inside cors
      try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const heading = req.query.heading || "Default Topic";

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(heading)}&key=${apiKey}`
        );

        const data = await response.json();
        const videos = data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title
        }));

        res.json(videos);
      } catch (error) {
        console.error("Error fetching from YouTube API:", error);
        res.status(500).send("Failed to fetch videos");
      }
    });
  }
);


// just checking whether i hid the right key
// const functions = require("firebase-functions");

// your function
// exports.testSecret = functions.https.onRequest(
//   {
//     secrets: ["YOUTUBE_API_KEY"],  // attach your secret here
//   },
//   (req, res) => {
//     const apiKey = process.env.YOUTUBE_API_KEY; // must match the secret name
//     console.log("YOUTUBE_API_KEY:", apiKey);
//     res.send("Check backend logs!");
//   }
// );