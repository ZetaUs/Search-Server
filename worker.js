export default {
  async fetch(request, env, ctx) {
    // 允许跨域所有域名
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("target");
    if (!targetUrl) return new Response("缺少target参数", { status:400 });
    
    const resp = await fetch(decodeURIComponent(targetUrl));
    const newResp = new Response(resp.body, resp);
    Object.entries(corsHeaders).forEach(([k,v])=>newResp.headers.set(k,v));
    return newResp;
  }
}
