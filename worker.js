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
    if (!q) return new Response(JSON.stringify({ error: "缺少关键词q" }), { status:400, headers:{...corsHeaders,"Content-Type":"application/json"} });

    try {
      // 免费公开SearXNG实例，返回标准网页搜索结果
      const searchUrl = new URL("https://search.nixnet.services/search");
      searchUrl.searchParams.set("q", q);
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("lang", "zh");

      const res = await fetch(searchUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36",
          "Accept-Language": "zh-CN,zh;q=0.9"
        }
      });

      if (!res.ok) throw new Error(`上游接口异常 ${res.status}`);
      const raw = await res.json();
      // 统一格式化结果给前端
      const results = (raw.results || []).map(item => ({
        url: item.url,
        title: item.title,
        desc: item.content || "暂无描述"
      }));

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: true, msg: err.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
