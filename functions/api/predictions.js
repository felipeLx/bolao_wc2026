import { ghGetJson, mutateJson, json, err, requireToken, normEmail, cleanScore } from "./_lib.js";

// POST /api/predictions { poolId, email, predictions: { "<matchId>": {h,a,q?} } }
// A trava de horário é aplicada AQUI, com o relógio do servidor:
// palpite de jogo já iniciado (ou ainda indefinido) é descartado.
export async function onRequestPost({ request, env }) {
  const missing = requireToken(env);
  if (missing) return missing;

  let body;
  try { body = await request.json(); } catch { return err("Corpo inválido."); }

  const email = normEmail(body.email);
  const poolId = String(body.poolId || "").trim();
  const incoming = body.predictions || {};
  if (!email || !poolId) return err("Dados incompletos.");
  if (typeof incoming !== "object") return err("Palpites inválidos.");

  let matches;
  try {
    matches = (await ghGetJson(env, "data/matches.json")).data.matches;
  } catch (e) {
    return err("Falha ao ler a tabela de jogos: " + e.message, 502);
  }
  const byId = new Map(matches.map((m) => [String(m.id), m]));

  const now = Date.now();
  const valid = {};
  const clearQuestion = [];
  const rejected = [];
  for (const [id, p] of Object.entries(incoming)) {
    const match = byId.get(String(id));
    const hasScores = typeof p?.h !== "undefined" || typeof p?.a !== "undefined";
    const hasQuestion = typeof p?.q !== "undefined";
    const h = cleanScore(p?.h);
    const a = cleanScore(p?.a);
    const q = p?.q === 1 || p?.q === true ? 1 : (p?.q === 0 || p?.q === false || typeof p?.q === "undefined" ? 0 : null);
    if (!match) { rejected.push(id); continue; }
    if (hasScores && (h === null || a === null)) { rejected.push(id); continue; }
    if (hasQuestion && (!match.checkboxQuestion || q === null)) { rejected.push(id); continue; }
    if (!hasScores && !hasQuestion) { rejected.push(id); continue; }
    if (match.placeholder || now >= Date.parse(match.kickoff)) { rejected.push(id); continue; }
    const next = {};
    if (hasScores) {
      next.h = h;
      next.a = a;
    }
    if (match.checkboxQuestion && q === 1) next.q = 1;
    if (match.checkboxQuestion && hasQuestion && q === 0) clearQuestion.push(String(id));
    valid[String(id)] = next;
  }
  if (!Object.keys(valid).length && !clearQuestion.length) {
    return err("Nenhum palpite válido para salvar (jogos já iniciados ficam travados).");
  }

  try {
    const pools = await mutateJson(env, "data/pools.json", () => ({ pools: {} }), (d) => {
      const member = d.pools?.[poolId]?.members?.[email];
      if (!member) throw Object.assign(new Error("Participante não encontrado neste bolão."), { user: true });
      member.predictions = member.predictions || {};
      for (const [id, next] of Object.entries(valid)) {
        const merged = { ...(member.predictions[id] || {}) };
        if (typeof next.h !== "undefined") {
          merged.h = next.h;
          merged.a = next.a;
        }
        if (next.q === 1) merged.q = 1;
        if (clearQuestion.includes(id)) delete merged.q;
        if (typeof merged.h === "undefined" && typeof merged.a === "undefined" && typeof merged.q === "undefined") delete member.predictions[id];
        else member.predictions[id] = merged;
      }
    }, `Palpites de ${email} (${poolId})`);
    return json({ pools, saved: new Set([...Object.keys(valid), ...clearQuestion]).size, rejected });
  } catch (e) {
    return err(e.user ? e.message : "Falha ao salvar: " + e.message, e.user ? 400 : 502);
  }
}
