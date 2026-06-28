import { ghGetJson, mutateJson, json, err, requireToken, normEmail, cleanScore } from "./_lib.js";

// POST /api/results { email, results: { "<matchId>": {h,a, winner?} } }
// Só admins, só jogos já iniciados.
// Para mata-mata, se h !== a o vencedor é automático; se h === a, "winner"
// deve conter o nome do time que avançou (pênaltis). O servidor propaga
// automaticamente para matches.json ("Match X Winner" → time real).
export async function onRequestPost({ request, env }) {
  const missing = requireToken(env);
  if (missing) return missing;

  let body;
  try { body = await request.json(); } catch { return err("Corpo inválido."); }

  const email = normEmail(body.email);
  const incoming = body.results || {};
  if (!email) return err("E-mail inválido.");

  let admins, matches;
  try {
    const [cfg, mt] = await Promise.all([
      ghGetJson(env, "data/config.json"),
      ghGetJson(env, "data/matches.json"),
    ]);
    admins = (cfg.data?.admins || []).map((e) => e.toLowerCase());
    matches = mt.data.matches;
  } catch (e) {
    return err("Falha ao ler configuração: " + e.message, 502);
  }
  if (!admins.includes(email)) return err("Apenas administradores lançam resultados.", 403);

  const byId = new Map(matches.map((m) => [String(m.id), m]));
  const now = Date.now();
  const valid = {};
  for (const [id, r] of Object.entries(incoming)) {
    const match = byId.get(String(id));
    const h = cleanScore(r?.h);
    const a = cleanScore(r?.a);
    if (!match || match.placeholder || h === null || a === null) continue;
    if (now < Date.parse(match.kickoff)) continue;
    const entry = { h, a };
    if (match.stage !== "Group Stage") {
      if (h !== a) {
        entry.winner = h > a ? match.home : match.away;
      } else if (r.winner && (r.winner === match.home || r.winner === match.away)) {
        entry.winner = r.winner;
      }
    }
    valid[String(id)] = entry;
  }
  if (!Object.keys(valid).length) return err("Nenhum resultado válido para salvar.");

  try {
    const results = await mutateJson(env, "data/results.json", () => ({ results: {} }), (d) => {
      d.results = d.results || {};
      Object.assign(d.results, valid);
    }, `Resultados lançados por ${email}`);

    // Auto-advance: propagate knockout winners to matches.json
    const toAdvance = {};
    for (const [id, r] of Object.entries(valid)) {
      if (!r.winner) continue;
      const match = byId.get(String(id));
      const loser = r.winner === match.home ? match.away : match.home;
      toAdvance[id] = { winner: r.winner, loser };
    }
    if (Object.keys(toAdvance).length) {
      try {
        const updatedMatches = await mutateJson(env, "data/matches.json",
          () => ({ matches: [] }),
          (d) => {
            for (const m of d.matches) {
              let changed = false;
              for (const [id, adv] of Object.entries(toAdvance)) {
                const winLabel = `Match ${id} Winner`;
                const loseLabel = `Match ${id} Loser`;
                if (m.home === winLabel) { m.home = adv.winner; changed = true; }
                if (m.away === winLabel) { m.away = adv.winner; changed = true; }
                if (m.home === loseLabel) { m.home = adv.loser; changed = true; }
                if (m.away === loseLabel) { m.away = adv.loser; changed = true; }
              }
              if (changed && !m.home.includes("Match ") && !m.away.includes("Match ") &&
                  !m.home.includes("Group ") && !m.away.includes("Group ")) {
                m.placeholder = false;
              }
            }
          },
          `[CI Skip] Chave atualizada por ${email}`
        );
      } catch { /* non-critical — bracket update failed but results saved */ }
    }

    return json({ results });
  } catch (e) {
    return err("Falha ao salvar: " + e.message, 502);
  }
}
