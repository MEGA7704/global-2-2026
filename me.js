import { json, getSession } from "../../_lib/common.js";
export async function onRequestGet({request, env}){
  const session = await getSession(request, env);
  return json({ok:!!session, user: session?.user || null});
}
