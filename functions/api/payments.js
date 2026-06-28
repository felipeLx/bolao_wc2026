import { ghGetJson, mutateJson, json, err, requireToken, normEmail } from "./_lib.js";

// POST /api/payments { poolId, email, action, ... }
// Ações:
//   "set-pix"   { pixKey }                — admin define a chave PIX do bolão
//   "mark"      { memberEmail }           — admin marca pagamento de um membro
//   "unmark"    { memberEmail }           — admin desmarca pagamento
//   "set-proof" { memberEmail, proof }    — admin anexa comprovante (base64 jpeg)
export async function onRequestPost({ request, env }) {
  const missing = requireToken(env);
  if (missing) return missing;

  let body;
  try { body = await request.json(); } catch { return err("Corpo inválido."); }

  const email = normEmail(body.email);
  const poolId = String(body.poolId || "").trim();
  const action = body.action;
  if (!email || !poolId) return err("Dados incompletos.");

  let admins;
  try {
    const cfg = await ghGetJson(env, "data/config.json");
    admins = (cfg.data?.admins || []).map((e) => e.toLowerCase());
  } catch (e) {
    return err("Falha ao ler configuração: " + e.message, 502);
  }
  if (!admins.includes(email)) return err("Apenas administradores gerenciam pagamentos.", 403);

  try {
    const pools = await mutateJson(env, "data/pools.json", () => ({ pools: {} }), (d) => {
      const pool = d.pools?.[poolId];
      if (!pool) throw Object.assign(new Error("Bolão não encontrado."), { user: true });
      pool.payments = pool.payments || {};

      if (action === "set-pix") {
        pool.pixKey = String(body.pixKey || "").trim().slice(0, 100);
      } else if (action === "mark") {
        const me = normEmail(body.memberEmail);
        if (!me || !pool.members[me]) throw Object.assign(new Error("Membro não encontrado."), { user: true });
        pool.payments[me] = { date: new Date().toISOString(), markedBy: email };
      } else if (action === "unmark") {
        const me = normEmail(body.memberEmail);
        if (!me) throw Object.assign(new Error("E-mail inválido."), { user: true });
        delete pool.payments[me];
      } else if (action === "set-proof") {
        const me = normEmail(body.memberEmail);
        if (!me) throw Object.assign(new Error("E-mail inválido."), { user: true });
        const proof = String(body.proof || "");
        if (!proof.startsWith("data:image/")) throw Object.assign(new Error("Imagem inválida."), { user: true });
        if (proof.length > 200_000) throw Object.assign(new Error("Imagem muito grande (máx ~150KB)."), { user: true });
        if (!pool.payments[me]) pool.payments[me] = { date: new Date().toISOString(), markedBy: email };
        pool.payments[me].proof = proof;
      } else {
        throw Object.assign(new Error("Ação inválida."), { user: true });
      }
    }, `[CI Skip] Pagamento atualizado por ${email} (${poolId})`);
    return json({ pools });
  } catch (e) {
    return err(e.user ? e.message : "Falha ao salvar: " + e.message, e.user ? 400 : 502);
  }
}
