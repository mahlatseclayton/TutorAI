const { onRequest } = require("firebase-functions/v2/https");

exports.getYoutubeVideos = onRequest(
  { secrets: ["YOUTUBE_API_KEY"], timeoutSeconds: 60, memory: "256Mi" },
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
        const grade = (req.query.grade || "").trim();
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return res.json({ error: false, videos: fallbackVideos, message: "API_KEY_MISSING" });
        }

        const videos = [];
        const seen = new Set();

        // --- DUAL SEARCH STRATEGY ---
        
        // Search 1: Ultra Precise (Quotes around heading) - optimizing for concept explanation and high views
        const preciseQuery = `"${heading}" ${subject} ${grade} full lesson crash course`.replace(/\s+/g, ' ').trim();
        const broadQuery = `${heading} ${subject} ${grade} complete lesson explanation`.replace(/\s+/g, ' ').trim();

        async function performSearch(query) {
            console.log(`POLLING YOUTUBE API FOR: "${query}"`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&order=relevance&videoDuration=medium&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${apiKey}`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(6000)
            });
            if (!response.ok) {
                console.error("YOUTUBE API ERROR:", await response.text());
                return [];
            }
            const data = await response.json();
            return data.items || [];
        }

        // Try Precise Search
        let results = await performSearch(preciseQuery);
        
        // Extract videos
        const extractVideos = (items) => {
            for (let item of items) {
                if (videos.length >= 4) break;
                try {
                    const videoId = item.id?.videoId;
                    if (videoId && !seen.has(videoId)) {
                      seen.add(videoId);
                      videos.push({
                        id: videoId,
                        title: item.snippet?.title || `${heading} Lesson`,
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
