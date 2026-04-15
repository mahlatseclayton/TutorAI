const { onRequest } = require("firebase-functions/v2/https");

exports.getYoutubeVideos = onRequest(
  { secrets: ["SEARLO_API_KEY"] },
  async (req, res) => {
    const allowedOrigins = [
      "https://tutorai-5f97d.web.app",
      "https://tutorai-5f97d.firebaseapp.com",
      "http://localhost:5000",
      "http://127.0.0.1:5000"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    try {
        const heading = req.query.heading || "Default Topic";
        const subject = req.query.subject || "";

        const searchQuery = `${heading} ${subject} Grade 12 lesson site:youtube.com`;
        const apiKey = process.env.SEARLO_API_KEY;

        const response = await fetch(
          `https://api.searlo.com/search?q=${encodeURIComponent(searchQuery)}&level=8`,
          {
            headers: {
              "X-API-KEY": apiKey,
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

        const youtubeResults = results.filter(
          (r) =>
            r.link &&
            (r.link.includes("youtube.com/watch") ||
              r.link.includes("youtu.be/"))
        );

        const videos = [];
        const seen = new Set();

        for (let item of youtubeResults) {
          if (videos.length >= REQUIRED_VIDEOS) break;

          const url = new URL(item.link);
          let videoId = "";

          if (item.link.includes("youtu.be/")) {
            videoId = url.pathname.substring(1);
          } else {
            videoId = url.searchParams.get("v");
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

        const fallbackVideos = [
          "M7lc1UVf-VE",
          "3JZ_D3ELwOQ",
          "aqCOfEx_l_U",
          "vI0QBRU27uE"
        ];

        let i = 0;
        while (videos.length < REQUIRED_VIDEOS && i < fallbackVideos.length) {
          const vId = fallbackVideos[i];
          if (!seen.has(vId)) {
            seen.add(vId);
            videos.push({
              id: vId,
              title: `${heading} Educational resource`,
              topic: heading,
              subject: subject,
            });
          }
          i++;
        }

        const finalVideos = videos.slice(0, REQUIRED_VIDEOS);

        res.json({ error: false, videos: finalVideos });
      } catch (error) {
        console.error("SEARCH ERROR:", error);
        res.status(500).json({ error: true, message: error.message });
      }
  }
);
