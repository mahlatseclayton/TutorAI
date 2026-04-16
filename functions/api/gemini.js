const { GoogleGenAI } = require("@google/genai");
const { onRequest } = require("firebase-functions/v2/https");

exports.topicTutor = onRequest(
  { secrets: ["GEMINI_API_KEY"], timeoutSeconds: 300 },
  async (req, res) => {

    // Enhanced Logging for Debugging
    const origin = req.headers.origin;
    console.log(`Incoming request from origin: ${origin}`);
    console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

    try {
      // CORS Headers
      const allowedOrigins = [
        "https://tutorai-5f97d.web.app",
        "https://tutorai-5f97d.firebaseapp.com",
        "https://mzansied.co.za",
        "https://www.mzansied.co.za",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
      ];
      
      if (allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
      }
      
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");

      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const userPrompt = req.body?.message;
      const base64Data = req.body?.image;

      if (!userPrompt) {
        return res.status(400).json({
          success: false,
          error: "NO_PROMPT_PROVIDED"
        });
      }

      // Explicit API Key Check
      if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY secret is missing from environment.");
        return res.status(500).json({
          success: false,
          error: "API_KEY_NOT_CONFIGURED"
        });
      }

      // Initialize the new Google Gen AI SDK (2026 Standard)
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = "You are a highly capable South African science and math tutor. Analyze the provided image or PDF document which contains a question. Provide a clear, accurate, and helpful response based on the requested style (Memo, Teaching, or Step-by-Step). \n\nCRITICAL RULES:\n1. Use LaTeX ($...$) for ALL mathematical expressions.\n2. If a sketch, diagram, or graph is needed, use clear SVG XML code (wrapped in ```html blocks) or highly structured text labels. Avoid messy ASCII art.\n3. Ensure all scientific constants and formulas are accurate.";

      let contents = [];
      if (base64Data) {
        console.log("Multimodal request detected (Image/PDF).");
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 image data format");
        }
        const mimeType = matches[1];
        const data = matches[2];

        contents = [
          { text: userPrompt },
          {
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          }
        ];
      } else {
        console.log("Text-only request detected.");
        contents = [{ text: userPrompt }];
      }

      // Robust retry logic for 503 High Demand errors
      let response;
      let lastError;
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
      
      for (const currentModel of modelsToTry) {
        try {
          console.log(`Attempting generation with model: ${currentModel}`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
          // If successful, break out of the retry loop
          break;
        } catch (err) {
          console.warn(`Model ${currentModel} failed:`, err.message);
          lastError = err;
          
          if (err.status === 503 || err.status === 429) {
            // High demand or rate limit - wait 1.5 seconds then try the next model
            console.log(`High demand or rate limit detected (HTTP ${err.status}). Waiting and falling back...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else if (err.status === 404) {
            // Model not found, immediately try the next model without waiting
            console.log(`Model ${currentModel} not found (HTTP 404). Falling back...`);
          } else {
            // Unhandled error type, throw it immediately
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("All fallback models failed.");
      }

      const responseText = response.text;
      console.log("AI Generation successful.");

      return res.status(200).json({
        success: true,
        aiResponse: responseText
      });

    } catch (error) {
      console.error("CRITICAL AI GATEWAY ERROR:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "AI_GENERATION_FAILED",
        details: error.toString(),
        stack: error.stack
      });
    }
  }
);
