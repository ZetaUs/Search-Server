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
    if (!q) {
      return new Response(JSON.stringify({ error: "缺少搜索关键词 q" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 实例优先级：主站 -> 3个备用站
    const instanceList = [
      "https://search.kael.ink/search",
      "https://searx.party/search",
      "https://search.sapti.me/search",
      "https://searx.tiekoetter.com/search"
    ];

    const searchParams = new URLSearchParams();
    searchParams.set("q", q);
    searchParams.set("format", "json");
    searchParams.set("lang", "zh");

    let lastErrMsg = "";
    // 逐个尝试实例，成功即返回
    for (const base of instanceList) {
      try {
        const targetUrl = `${base}?${searchParams.toString()}`;
        const res = await fetch(targetUrl, {
          signal: AbortSignal.timeout(6000), // 单实例6秒超时
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9"
          }
        });

        if (!res.ok) throw new Error(`实例${base}返回${res.status}`);
        const raw = await res.json();
        const results = (raw.results || []).map(item => ({
          url: item.url,
          title: item.title,
          desc: item.content || "暂无页面描述"
        }));

        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        lastErrMsg = err.message;
        continue; // 当前实例失败，循环下一个备用
      }
    }

    // 全部实例都失效才返回报错
    return new Response(JSON.stringify({ error: true, msg: "所有搜索实例均不可用：" + lastErrMsg }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
