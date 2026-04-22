const { onRequest } = require("firebase-functions/v2/https");

exports.getYoutubeVideos = onRequest(
  { secrets: ["SEARLO_API_KEY"], timeoutSeconds: 60, memory: "256Mi" },
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
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    // Default Fallback Videos
    const fallbackVideos = [
      { id: "M7lc1UVf-VE", title: "Study Skills & Motivation" },
      { id: "3JZ_D3ELwOQ", title: "Effective Learning Techniques" },
      { id: "aqCOfEx_l_U", title: "Time Management for Students" },
      { id: "vI0QBRU27uE", title: "Consistency in Studying" }
    ];

    try {
        const heading = req.query.heading || "Education";
        const subject = req.query.subject || "";
        const apiKey = process.env.SEARLO_API_KEY;

        if (!apiKey) {
            console.error("SEARCH FAIL: SEARLO_API_KEY missing.");
            // Don't crash (500), just return fallbacks
            return res.json({ error: false, videos: fallbackVideos, message: "API_KEY_MISSING" });
        }

        const searchQuery = `${heading} ${subject} Grade 12 lesson site:youtube.com`;
        
        const response = await fetch(
          `https://api.searlo.com/search?q=${encodeURIComponent(searchQuery)}&level=8`,
          {
            headers: { "X-API-KEY": apiKey },
            signal: AbortSignal.timeout(8000) // 8 second timeout for the upstream API
          }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Searlo API Failure (${response.status}):`, errText);
            return res.json({ error: false, videos: fallbackVideos, message: `UPSTREAM_FAILURE_${response.status}` });
        }

        const data = await response.json();
        const results = data.organic || [];
        const youtubeResults = results.filter(r => r.link && (r.link.includes("youtube.com/watch") || r.link.includes("youtu.be/")));

        if (youtubeResults.length === 0) {
            return res.json({ error: false, videos: fallbackVideos, message: "NO_SEARCH_RESULTS" });
        }

        const videos = [];
        const seen = new Set();

        for (let item of youtubeResults) {
          if (videos.length >= 4) break;

          try {
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
                title: item.title || `${heading} Lesson`,
                topic: heading,
                subject: subject,
              });
            }
          } catch (urlErr) {
            continue;
          }
        }

        // Fill remaining slots with fallbacks if needed
        let i = 0;
        while (videos.length < 4 && i < fallbackVideos.length) {
            if (!seen.has(fallbackVideos[i].id)) {
                videos.push({
                    id: fallbackVideos[i].id,
                    title: fallbackVideos[i].title,
                    topic: heading,
                    subject: subject
                });
                seen.add(fallbackVideos[i].id);
            }
            i++;
        }

        return res.json({ error: false, videos: videos.slice(0, 4) });

      } catch (error) {
        console.error("CRITICAL YOUTUBE ERROR:", error);
        // CRITICAL: Always return fallback instead of 500 to keep the UI clean
        return res.json({ 
            error: false, 
            videos: fallbackVideos, 
            message: "INTERNAL_ERROR",
            debug_info: error.message 
        });
      }
  }
);
