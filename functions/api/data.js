import { ghGetJson, json, err, requireToken } from "./_lib.js";

// GET /api/data → bolões + resultados + matches, sempre frescos direto do GitHub
export async function onRequestGet({ env }) {
  const missing = requireToken(env);
  if (missing) return missing;
  try {
    const [p, r, m] = await Promise.all([
      ghGetJson(env, "data/pools.json"),
      ghGetJson(env, "data/results.json"),
      ghGetJson(env, "data/matches.json"),
    ]);
    return json({
      pools: p.data || { pools: {} },
      results: r.data || { results: {} },
      matches: m.data || { matches: [] },
    });
  } catch (e) {
    return err("Falha ao ler dados no GitHub: " + e.message, 502);
  }
}
