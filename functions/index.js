// this acts as a server

// --- API: Gemini / Topic Tutor ---
const { topicTutor } = require("./api/gemini");
exports.topicTutor = topicTutor;

// --- API: YouTube / Searlo Search ---
const { getYoutubeVideos } = require("./api/youtube");
exports.getYoutubeVideos = getYoutubeVideos;

// --- API: reCAPTCHA Verification ---
const { verifyCaptcha } = require("./api/captcha");
exports.verifyCaptcha = verifyCaptcha;