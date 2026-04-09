import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    if (!videoId || typeof videoId !== "string") {
      return new Response(JSON.stringify({ error: "videoId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use YouTube's oEmbed endpoint (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const res = await fetch(oembedUrl);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    // Parse "Artist - Title" pattern from the video title
    const fullTitle: string = data.title || "";
    let artistName = "";
    let trackTitle = fullTitle;

    // Common separators: " - ", " – ", " — ", " | "
    const separators = [" - ", " – ", " — ", " | "];
    for (const sep of separators) {
      const idx = fullTitle.indexOf(sep);
      if (idx > 0) {
        artistName = fullTitle.substring(0, idx).trim();
        trackTitle = fullTitle.substring(idx + sep.length).trim();
        break;
      }
    }

    // Clean common suffixes from track title
    trackTitle = trackTitle
      .replace(/\s*\(official\s*(music\s*)?video\)/gi, "")
      .replace(/\s*\[official\s*(music\s*)?video\]/gi, "")
      .replace(/\s*\(official\s*audio\)/gi, "")
      .replace(/\s*\[official\s*audio\]/gi, "")
      .replace(/\s*\(lyrics?\)/gi, "")
      .replace(/\s*\[lyrics?\]/gi, "")
      .replace(/\s*\(visuali[sz]er\)/gi, "")
      .replace(/\s*\[visuali[sz]er\]/gi, "")
      .trim();

    return new Response(
      JSON.stringify({
        title: trackTitle,
        artist: artistName,
        channelName: data.author_name || "",
        thumbnail: data.thumbnail_url || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
