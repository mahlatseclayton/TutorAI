/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.topicTutor = functions.https.onRequest(async (req, res) => {

  return cors(req, res, async () => {

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

      return res.json({
        success: true,
        aiResponse: response.data.choices[0].message.content
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      });

    }

  });

});