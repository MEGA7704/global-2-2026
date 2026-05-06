import { json, readJson, ensureUsers, sha256, uid, auditKey } from "../../_lib/common.js";
export async function onRequestPost({request, env}){
  const body = await readJson(request);
  const username = String(body.username || body.role || "").toLowerCase().trim();
  const password = String(body.password || "");
  const users = await ensureUsers(env);
  const user = users.find(u => u.username.toLowerCase() === username && u.active !== false);
  if(!user || user.passwordHash !== await sha256(user.salt+":"+password)) return json({ok:false,error:"Identifiants incorrects"},403);
  user.lastLoginAt = new Date().toISOString();
  await env.GLOBAL2_KV.put("users", JSON.stringify(users));
  const token = uid("sess");
  const expiresAt = new Date(Date.now()+1000*60*60*12).toISOString();
  await env.GLOBAL2_KV.put("session:"+token, JSON.stringify({userId:user.id, createdAt:new Date().toISOString(), expiresAt}), {expirationTtl:60*60*12});
  const events = await env.GLOBAL2_KV.get(auditKey(), "json") || [];
  events.push({type:"login", userId:user.id, username:user.username, role:user.role, at:new Date().toISOString()});
  await env.GLOBAL2_KV.put(auditKey(), JSON.stringify(events.slice(-500)), {expirationTtl:60*60*24*45});
  return json({ok:true,user:{id:user.id,name:user.name,username:user.username,role:user.role},expiresAt},200,{"set-cookie":`G2_SESSION=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`});
}
