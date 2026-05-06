import { json, readJson, requireAuth, stateKeyForUser, auditKey } from "../../_lib/common.js";
export async function onRequestPost({request, env}){
  const r = await requireAuth(request, env); if(r.error) return r.error;
  const body = await readJson(request);
  const previous = await env.GLOBAL2_KV.get(stateKeyForUser(r.session.user), "json");
  const state = {
    ...(previous || {}),
    ...(body.state || {}),
    version: Date.now(),
    updatedAt: new Date().toISOString(),
    updatedBy: r.session.user.username
  };
  await env.GLOBAL2_KV.put(stateKeyForUser(r.session.user), JSON.stringify(state));
  const events = await env.GLOBAL2_KV.get(auditKey(), "json") || [];
  events.push({type:"save", userId:r.session.user.id, username:r.session.user.username, role:r.session.user.role, reason:body.reason||"auto", version:state.version, at:state.updatedAt});
  await env.GLOBAL2_KV.put(auditKey(), JSON.stringify(events.slice(-500)), {expirationTtl:60*60*24*45});
  return json({ok:true, version:state.version, updatedAt:state.updatedAt, user:r.session.user});
}
