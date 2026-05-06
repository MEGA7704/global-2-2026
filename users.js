import { json, readJson, ensureUsers, sha256, uid, requireAdmin } from "../../_lib/common.js";
export async function onRequestGet({request, env}){
  const r = await requireAdmin(request, env); if(r.error) return r.error;
  const users = await ensureUsers(env);
  return json({ok:true, users:users.map(({passwordHash,salt,...u})=>u)});
}
export async function onRequestPost({request, env}){
  const r = await requireAdmin(request, env); if(r.error) return r.error;
  const body = await readJson(request);
  const username=String(body.username||"").toLowerCase().trim();
  const name=String(body.name||username).trim();
  const role=["admin","caisse"].includes(body.role)?body.role:"caisse";
  const password=String(body.password||"");
  if(!username || password.length<6) return json({ok:false,error:"Nom utilisateur et mot de passe de 6 caractères minimum requis"},400);
  const users=await ensureUsers(env);
  if(users.some(u=>u.username.toLowerCase()===username)) return json({ok:false,error:"Utilisateur déjà existant"},409);
  const salt=uid("salt");
  users.push({id:uid("u"), name, username, role, active:true, salt, passwordHash:await sha256(salt+":"+password), createdAt:new Date().toISOString()});
  await env.GLOBAL2_KV.put("users", JSON.stringify(users));
  return json({ok:true});
}
export async function onRequestPatch({request, env}){
  const r = await requireAdmin(request, env); if(r.error) return r.error;
  const body = await readJson(request); const users=await ensureUsers(env);
  const user=users.find(u=>u.id===body.id); if(!user) return json({ok:false,error:"Utilisateur introuvable"},404);
  if(typeof body.active === "boolean") user.active=body.active;
  if(body.password){ user.salt=uid("salt"); user.passwordHash=await sha256(user.salt+":"+String(body.password)); }
  await env.GLOBAL2_KV.put("users", JSON.stringify(users));
  return json({ok:true});
}
