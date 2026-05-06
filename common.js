export function json(data, status=200, extraHeaders={}){
  return new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json; charset=utf-8", ...extraHeaders}});
}
export async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
export function uid(prefix="id"){
  const a = new Uint8Array(24); crypto.getRandomValues(a);
  return prefix + "_" + [...a].map(b=>b.toString(16).padStart(2,"0")).join("");
}
export function getCookie(request, name){
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map(v=>v.trim()).find(v=>v.startsWith(name+"="))?.split("=").slice(1).join("=") || "";
}
export async function readJson(request){
  try{return await request.json();}catch{return {};}
}
const DEFAULT_USERS = [
  {id:"u_admin", name:"Administrateur", username:"admin", role:"admin", active:true, password:"ADMIN2026"},
  {id:"u_caisse", name:"La Caisse", username:"caisse", role:"caisse", active:true, password:"CAISSE2026"}
];
export async function ensureUsers(env){
  let users = await env.GLOBAL2_KV.get("users", "json");
  if(Array.isArray(users) && users.length) return users;
  users = [];
  for(const u of DEFAULT_USERS){
    const salt = uid("salt");
    users.push({...u, salt, passwordHash: await sha256(salt+":"+u.password), password: undefined, createdAt: new Date().toISOString()});
  }
  await env.GLOBAL2_KV.put("users", JSON.stringify(users));
  return users;
}
export async function getSession(request, env){
  const token = getCookie(request,"G2_SESSION") || request.headers.get("x-g2-session") || "";
  if(!token) return null;
  const session = await env.GLOBAL2_KV.get("session:"+token, "json");
  if(!session || !session.userId) return null;
  if(session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()){
    await env.GLOBAL2_KV.delete("session:"+token); return null;
  }
  const users = await ensureUsers(env);
  const user = users.find(u=>u.id===session.userId && u.active!==false);
  if(!user) return null;
  return {token, user:{id:user.id, name:user.name, username:user.username, role:user.role}};
}
export async function requireAuth(request, env){
  const s = await getSession(request, env);
  if(!s) return {error: json({ok:false,error:"Session expirée ou non connectée"},401)};
  return {session:s};
}
export async function requireAdmin(request, env){
  const r = await requireAuth(request, env);
  if(r.error) return r;
  if(r.session.user.role !== "admin") return {error: json({ok:false,error:"Accès réservé à l’administrateur"},403)};
  return r;
}
export function stateKeyForUser(user){ return "state:user:" + user.id; }
export function auditKey(){ return "audit:" + new Date().toISOString().slice(0,10); }
