const { GoogleGenerativeAI } = require("@google/generative-ai");
const { onRequest } = require("firebase-functions/v2/https");

exports.topicTutor = onRequest(
  { secrets: ["GEMINI_API_KEY"] },
  async (req, res) => {

    // CORS Headers
    const allowedOrigins = [
      "https://tutorai-5f97d.web.app",
      "https://tutorai-5f97d.firebaseapp.com",
      "https://mzansied.co.za",
      "https://www.mzansied.co.za",
      "http://localhost:5000",
      "http://127.0.0.1:5000"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    try {
      const userPrompt = req.body?.message;
      const base64Data = req.body?.image;

      if (!userPrompt) {
        return res.status(400).json({
          success: false,
          error: "NO_PROMPT_PROVIDED"
        });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are a highly capable South African science and math tutor. Analyze the provided image or PDF document which contains a question. Provide a clear, accurate, and helpful response based on the requested style (Memo, Teaching, or Step-by-Step). \n\nCRITICAL RULES:\n1. Use LaTeX ($...$) for ALL mathematical expressions.\n2. If a sketch, diagram, or graph is needed, use clear SVG XML code (wrapped in ```html blocks) or highly structured text labels. Avoid messy ASCII art.\n3. Ensure all scientific constants and formulas are accurate."
      });

      let result;
      if (base64Data) {
        console.log("Multimodal request detected (Image/PDF).");
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
  }
);
