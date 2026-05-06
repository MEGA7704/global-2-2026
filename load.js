import { json, requireAuth, stateKeyForUser } from "../../_lib/common.js";
export async function onRequestGet({request, env}){
  const r = await requireAuth(request, env); if(r.error) return r.error;
  const key = stateKeyForUser(r.session.user);
  const state = await env.GLOBAL2_KV.get(key, "json");
  return json({ok:true, state: state || null, version: state?.version || 0, user:r.session.user});
}
