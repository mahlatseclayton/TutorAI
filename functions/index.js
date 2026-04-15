/**
 * TutorAI Backend Entry Point
 * 
 * This file modularizes the Cloud Functions by exporting 
 * them from individual API files.
 */

// --- API: Gemini / Topic Tutor ---
const { topicTutor } = require("./api/gemini");
exports.topicTutor = topicTutor;

// --- API: YouTube / Searlo Search ---
const { getYoutubeVideos } = require("./api/youtube");
exports.getYoutubeVideos = getYoutubeVideos;

// --- API: reCAPTCHA Verification ---
const { verifyCaptcha } = require("./api/captcha");
exports.verifyCaptcha = verifyCaptcha;