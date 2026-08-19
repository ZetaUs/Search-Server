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
    const targetRaw = url.searchParams.get("target");
    if (!targetRaw) return new Response("缺少 target 参数", { status: 400 });

    const target = decodeURIComponent(targetRaw);
    const resp = await fetch(target);
    const newResp = new Response(resp.body, resp);
    Object.entries(corsHeaders).forEach(([k, v]) => newResp.headers.set(k, v));
    return newResp;
  }
};
