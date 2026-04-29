const { onCall, HttpsError } = require("firebase-functions/v2/https");
const axios = require("axios");

exports.verifyCaptcha = onCall(
  { secrets: ["RECAPTCHA_API"] },
  async (request) => {
    try {
      const token = request.data.token;

      if (!token) {
        console.error("CAPTCHA: No token provided in request");
        return {
          success: false,
          error: "NO_TOKEN"
        };
      }

      const secret = process.env.RECAPTCHA_API;
      if (!secret) {
        console.error("CAPTCHA: RECAPTCHA_API secret is not configured");
        return {
          success: false,
          error: "SECRET_NOT_CONFIGURED"
        };
      }

      // Google reCAPTCHA requires parameters in the POST body
      // application/x-www-form-urlencoded is the standard
      const params = new URLSearchParams();
      params.append("secret", secret);
      params.append("response", token);

      console.log("CAPTCHA: Sending verification request to Google...");

      const response = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      const data = response.data;
      console.log("CAPTCHA RESULT:", JSON.stringify(data));

      if (data.success) {
        return {
          success: true
        };
      } else {
        console.error("CAPTCHA FAILED:", data["error-codes"]);
        return {
          success: false,
          error: "VERIFICATION_FAILED",
          details: data["error-codes"]
        };
      }

    } catch (error) {
      console.error("CAPTCHA ERROR:", error);
      return {
        success: false,
        error: "INTERNAL_ERROR",
        message: error.message
      };
    }
  }
);
