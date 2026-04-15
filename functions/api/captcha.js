const { onCall } = require("firebase-functions/v2/https");
const axios = require("axios");

exports.verifyCaptcha = onCall(
  { secrets: ["RECAPTCHA_API"] },
  async (request) => {
    try {
      const token = request.data.token;

      if (!token) {
        return {
          success: false,
          error: "NO_TOKEN"
        };
      }

      const secret = process.env.RECAPTCHA_API;

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
