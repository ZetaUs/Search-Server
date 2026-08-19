export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (!q) return new Response("缺少搜索关键词 q", { status:400, headers:corsHeaders });

    try {
      // 使用网页搜索接口，而非问答API
      const searchUrl = new URL("https://html.duckduckgo.com/html/");
      searchUrl.searchParams.set("q", q);
      searchUrl.searchParams.set("kl", "zh-cn");
      searchUrl.searchParams.set("b", "");

      const res = await fetch(searchUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const htmlText = await res.text();

      // 正则提取标题、链接、描述
      const resultReg = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<div class="result__snippet">([\s\S]*?)<\/div>/g;
      const results = [];
      let match;
      while ((match = resultReg.exec(htmlText)) !== null) {
        results.push({
          url: decodeURIComponent(match[1]),
          title: match[2].trim(),
          desc: match[3].replace(/<.*?>/g, "").trim()
        });
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "搜索失败", msg:e.message }), {
        status:500, headers:{...corsHeaders, "Content-Type":"application/json"}
      });
    }
  }
};
