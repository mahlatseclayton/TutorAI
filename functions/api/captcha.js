const functions = require("firebase-functions");
const axios = require("axios");

exports.verifyCaptcha = functions.https.onCall(
  { secrets: ["RECAPTCHA_SECRET"] },
  async (data, context) => {
    try {
      const token = data.token;

      if (!token) {
        return {
          success: false,
          error: "NO_TOKEN"
        };
      }

      const secret = process.env.RECAPTCHA_SECRET;

      const response = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        null,
        {
          params: {
            secret: secret,
            response: token
          }
        }
      );

      return {
        success: response.data.success
      };

    } catch (error) {
      console.error("CAPTCHA ERROR:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
);
