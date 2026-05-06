import { json, getCookie } from "../../_lib/common.js";
export async function onRequestPost({request, env}){
  const token = getCookie(request,"G2_SESSION") || request.headers.get("x-g2-session") || "";
  if(token) await env.GLOBAL2_KV.delete("session:"+token);
  return json({ok:true},200,{"set-cookie":"G2_SESSION=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
}
