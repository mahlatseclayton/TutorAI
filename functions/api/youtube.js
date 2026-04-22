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
        const heading = (req.query.heading || "").trim();
        const subject = (req.query.subject || "").trim();
        const apiKey = process.env.SEARLO_API_KEY;

        if (!apiKey) {
            return res.json({ error: false, videos: fallbackVideos, message: "API_KEY_MISSING" });
        }

        const videos = [];
        const seen = new Set();

        // --- DUAL SEARCH STRATEGY ---
        
        // Search 1: Ultra Precise (Quotes around heading)
        const preciseQuery = `"${heading}" ${subject} Grade 12 lesson youtube`.trim();
        const broadQuery = `${heading} ${subject} Grade 12 educational youtube`.trim();

        async function performSearch(query) {
            console.log(`POLLING SEARLO FOR: "${query}"`);
            const response = await fetch(
                `https://api.searlo.com/search?q=${encodeURIComponent(query)}&level=8`,
                {
                    headers: { "X-API-KEY": apiKey },
                    signal: AbortSignal.timeout(6000)
                }
            );
            if (!response.ok) return [];
            const data = await response.json();
            return data.organic || [];
        }

        // Try Precise Search
        let results = await performSearch(preciseQuery);
        
        // Extract videos
        const extractVideos = (organicResults) => {
            const filtered = organicResults.filter(r => {
                if (!r.link) return false;
                const l = r.link.toLowerCase();
                return l.includes("youtube.com/watch") || 
                       l.includes("youtu.be/") || 
                       l.includes("youtube.com/shorts/") ||
                       l.includes("m.youtube.com/watch");
            });

            for (let item of filtered) {
                if (videos.length >= 4) break;
                try {
                    const url = new URL(item.link);
                    let videoId = "";
                    if (item.link.includes("youtu.be/")) {
                      videoId = url.pathname.substring(1);
                    } else if (item.link.includes("/shorts/")) {
                      videoId = url.pathname.split("/").pop();
                    } else {
                      videoId = url.searchParams.get("v");
                    }
                    if (!videoId && item.link.includes("v=")) {
                         videoId = item.link.split("v=")[1].split("&")[0];
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
                } catch (e) { continue; }
            }
        };

        extractVideos(results);

        // Try Broad Search if we don't have enough videos
        if (videos.length < 2) {
            console.log("PRECISE SEARCH RETURNED LOW RESULTS. TRYING BROAD...");
            results = await performSearch(broadQuery);
            extractVideos(results);
        }

        // Final Fallbacks if still low
        if (videos.length === 0) {
            console.warn(`CRITICAL: ZERO RESULTS FOR BOTH QUERIES. USING FALLBACKS.`);
            return res.json({ error: false, videos: fallbackVideos, message: "NO_SEARCH_RESULTS" });
        }

        // Fill remaining slots with fallbacks to avoid empty space
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
        return res.json({ 
            error: false, 
            videos: fallbackVideos, 
            message: "INTERNAL_ERROR"
        });
      }
  }
);
