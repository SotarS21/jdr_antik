// Tests complémentaires du point 80 (monde testantique, compte MJ « Gamemaster ») :
// jets d'esquive / parade, arme à distance, armes et attaques par catégorie du PNJ, effet du
// compendium « Effets » (construit comme le correctif 0.6.151-statuts-effets, posé sur un
// acteur de test sans toucher au compendium), jeton de PNJ non lié, retrait par le panneau
// d'effets, description de l'effet créé, initiative lancée depuis le suivi de combat.
// Ne crée que des acteurs « [TEST] » (+ jetons, combat, messages), tous supprimés à la fin.
// Usage : node packs/_test-point80b.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const npx = path.join(execSync("npm config get cache").toString().trim(), "_npx");
const pw = fs.readdirSync(npx).map(d => path.join(npx, d, "node_modules", "playwright", "index.mjs")).find(f => fs.existsSync(f));
const { chromium } = await import(pathToFileURL(pw).href);

const res = [];
const errors = [];
let ko = 0;
const ok = (name, cond, detail = "") => { if (!cond) ko++; res.push(`${cond ? "OK" : "KO"} ${name}${detail !== "" ? " — " + detail : ""}`); };

// 0. Source du compendium : les 12 statuts de packs/effets.db = liste validée
const SPEC = {
  peur: [["tousTests", -1]], terrorise: [["tousTests", -3]], etourdi: [["tousTests", -2], ["ca", -2]],
  aveugle: [["attaque", -4], ["ca", -2]], aTerre: [["attaque", -2], ["ca", -2]], entrave: "ENTRAVE",
  empoisonne: [["tousTests", -1]], saignement: [], endormi: [["ca", -4]], inconscient: [["ca", -4]],
  beni: [["tousTests", 1]], dead: []
};
const dbStatuts = fs.readFileSync(path.join(ROOT, "packs/effets.db"), "utf8").split("\n").filter(Boolean)
  .map(l => JSON.parse(l)).filter(d => d._id.startsWith("eStatut"));
ok("packs/effets.db : 12 statuts", dbStatuts.length === 12, dbStatuts.length);
for (const d of dbStatuts) {
  const id = d.statuses?.[0];
  const spec = SPEC[id];
  const exp = spec === "ENTRAVE"
    ? [["system.deplacement", "override", "0"], ["system.modificateurs.esquive", "add", "-2"]]
    : (spec ?? []).map(([k, v]) => [`system.modificateurs.${k}`, "add", String(v)]);
  const got = d.system.changes.map(c => [c.key, c.type, c.value]);
  ok(`effets.db ${d.name} (${id}) : changements = liste validée`, spec !== undefined && JSON.stringify(got) === JSON.stringify(exp), JSON.stringify(got));
}

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let page;
const msgIds = [];
const wait = ms => page.waitForTimeout(ms);
try {
  page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  page.on("pageerror", e => errors.push(e.stack ?? e.message));
  page.on("console", m => { if (m.type() === "error" && !/résolution/.test(m.text())) errors.push("console: " + m.text()); });
  const status = await (await fetch("http://localhost:30000/api/status")).json();
  if (status.world !== "testantique") throw new Error("monde actif : " + status.world);
  await page.goto("http://localhost:30000/join");
  await page.fill("#join-username, input[name=username]", "Gamemaster");
  await page.click("button[name=join]");
  await page.waitForFunction(() => window.game?.ready, null, { timeout: 120000 });
  await wait(3000);
  await page.evaluate(() => { for (const app of foundry.applications.instances.values()) if (app.id !== "sidebar" && app.options?.window) try { app.close(); } catch {} });

  const ids = await page.evaluate(async () => {
    const pj = await Actor.create({ name: "[TEST] PJ compl", type: "character", prototypeToken: { actorLink: true } });
    const [arc] = await pj.createEmbeddedDocuments("Item", [{ name: "[TEST] Arc", type: "weapon",
      system: { attBonus: 0, category: "armeBlanche", attBonusDistance: 2, categoryDistance: "armeADistance" } }]);
    const pnj = await Actor.create({ name: "[TEST] PNJ compl", type: "npc", prototypeToken: { actorLink: false },
      system: { ca: { value: 14 }, esquive: { value: 3 }, parade: { value: 2 }, initiative: { value: 2 },
                attackBonuses: { armeBlanche: { total: 3 } } } });
    const [lance] = await pnj.createEmbeddedDocuments("Item", [{ name: "[TEST] Lance", type: "weapon", system: { attBonus: 1, category: "armeBlanche" } }]);
    return { pj: pj.id, arc: arc.id, pnj: pnj.id, lance: lance.id };
  });
  const toggle = (id, s, active) => page.evaluate(({ id, s, active }) => game.actors.get(id).toggleStatusEffect(s, { active }), { id, s, active });

  // 1. Jets d'esquive / parade (le jet ajoute −1 de pénalité temporaire : remise à 0 après chaque jet)
  const dodge = (id, skill) => page.evaluate(async ({ id, skill }) => {
    const a = game.actors.get(id);
    const isPJ = a.type === "character";
    const r = await a.rollDodgeSkill(skill);
    const m = game.messages.contents.at(-1);
    const path = isPJ ? `system.skills.${skill}.tempPenalty` : `system.${skill}.tempPenalty`;
    const penalite = foundry.utils.getProperty(a, path);
    await a.update({ [path]: 0 });
    return { fixe: r.total - r.dice[0].total, penalite, msgId: m.id, flavor: m.flavor };
  }, { id, skill });
  for (const [label, id] of [["PJ", ids.pj], ["PNJ", ids.pnj]]) {
    for (const skill of ["esquive", "parade"]) {
      const b = await dodge(id, skill); msgIds.push(b.msgId);
      await toggle(id, "peur", true); await wait(300);
      const p = await dodge(id, skill); msgIds.push(p.msgId);
      await toggle(id, "peur", false); await wait(300);
      ok(`${label} jet de ${skill} avec Peur : −1`, p.fixe === b.fixe - 1 && /Peur −1/.test(p.flavor), `${b.fixe} → ${p.fixe}`);
      ok(`${label} jet de ${skill} : pénalité de réaction toujours appliquée (−1)`, p.penalite === -1, p.penalite);
    }
    await toggle(id, "entrave", true); await wait(300);
    const e = await dodge(id, "esquive"); msgIds.push(e.msgId);
    await toggle(id, "entrave", false); await wait(300);
    const e0 = await dodge(id, "esquive"); msgIds.push(e0.msgId);
    ok(`${label} jet d'esquive Entravé : −2`, e.fixe === e0.fixe - 2, `${e0.fixe} → ${e.fixe}`);
  }

  // 2. Arme à distance (PJ), arme et attaque par catégorie (PNJ)
  const atk = (actorId, fn) => page.evaluate(async ({ actorId, fn }) => {
    const a = game.actors.get(actorId);
    const [kind, arg, mode] = fn;
    const r = kind === "item" ? await a.items.get(arg)._executeAttackRoll(mode) : await a.rollAttackCategory(arg);
    const m = game.messages.contents.at(-1);
    return { fixe: r.total - r.dice[0].total, msgId: m.id, flavor: m.flavor };
  }, { actorId, fn });
  for (const [label, actorId, fn] of [
    ["PJ arme à distance", ids.pj, ["item", ids.arc, "distance"]],
    ["PNJ arme (corps à corps)", ids.pnj, ["item", ids.lance, "melee"]],
    ["PNJ attaque par catégorie", ids.pnj, ["cat", "armeBlanche"]]
  ]) {
    const b = await atk(actorId, fn); msgIds.push(b.msgId);
    await toggle(actorId, "aveugle", true); await toggle(actorId, "beni", true); await wait(300);
    const s = await atk(actorId, fn); msgIds.push(s.msgId);
    await toggle(actorId, "aveugle", false); await toggle(actorId, "beni", false); await wait(300);
    ok(`${label} : Aveuglé + Béni = −3`, s.fixe === b.fixe - 3 && /Aveuglé −4/.test(s.flavor) && /Béni \+1/.test(s.flavor), `${b.fixe} → ${s.fixe}`);
  }

  // 3. Effet du compendium (même construction que le correctif) glissé sur un acteur
  const comp = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const s = CONFIG.ANTIQUE.statuts.find(x => x.id === "etourdi");
    const caBase = a.system.ca.total;
    const [eff] = await a.createEmbeddedDocuments("ActiveEffect", [{
      name: game.i18n.localize(`ANTIQUE.Statut.${s.id}`), img: s.img, type: "base", system: { changes: s.changes },
      disabled: false, description: game.i18n.localize(`ANTIQUE.StatutDesc.${s.id}`), transfer: true,
      statuses: [s.id], showIcon: CONST.ACTIVE_EFFECT_SHOW_ICON.ALWAYS
    }]);
    await new Promise(r => setTimeout(r, 300));
    const out = { statut: a.statuses.has("etourdi"), tous: a.system.modificateurs.tousTests, ca: a.system.ca.total - caBase };
    // Le menu du jeton le reconnaît : décocher le statut retire cet effet
    await a.toggleStatusEffect("etourdi", { active: false });
    await new Promise(r => setTimeout(r, 300));
    out.retire = !a.effects.get(eff.id) && a.system.modificateurs.tousTests === 0 && a.system.ca.total === caBase;
    return out;
  }, ids.pj);
  ok("effet de compendium Étourdi : statut reconnu, −2 aux tests, −2 CA", comp.statut && comp.tous === -2 && comp.ca === -2, JSON.stringify(comp));
  ok("effet de compendium : retiré en décochant le statut du jeton", comp.retire);

  // 6. Description sur l'effet réellement créé depuis le menu
  const desc = await page.evaluate(async id => {
    const a = game.actors.get(id);
    await a.toggleStatusEffect("peur", { active: true });
    const d = a.effects.find(e => e.statuses.has("peur"))?.description ?? "";
    await a.toggleStatusEffect("peur", { active: false });
    return d;
  }, ids.pj);
  ok("description sur l'effet créé", /−1 à tous les tests/.test(desc), desc);

  // 4. Jeton de PNJ non lié : statut propre au jeton
  const unl = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const td = await a.getTokenDocument({ x: canvas.stage.pivot.x, y: canvas.stage.pivot.y });
    const [t] = await canvas.scene.createEmbeddedDocuments("Token", [td.toObject()]);
    await t.actor.toggleStatusEffect("endormi", { active: true });
    await new Promise(r => setTimeout(r, 500));
    return { tokenId: t.id, lie: t.actorLink, caJeton: t.actor.system.ca.value, caActeur: a.system.ca.value, effetsActeur: a.effects.size };
  }, ids.pnj);
  ok("jeton de PNJ non lié : Endormi sur le jeton seulement (CA 10, acteur 14)",
    !unl.lie && unl.caJeton === 10 && unl.caActeur === 14 && unl.effetsActeur === 0, JSON.stringify(unl));

  // 5. Retrait par clic dans le panneau d'effets (jeton du PJ, lié)
  const pan = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const td = await a.getTokenDocument({ x: canvas.stage.pivot.x + canvas.grid.size * 2, y: canvas.stage.pivot.y });
    const [t] = await canvas.scene.createEmbeddedDocuments("Token", [td.toObject()]);
    await a.toggleStatusEffect("terrorise", { active: true });
    await new Promise(r => setTimeout(r, 500));
    t.object.control({ releaseOthers: true });
    await new Promise(r => setTimeout(r, 800));
    const icons = document.querySelectorAll("#antique-effects-panel .antique-effects-panel-icon");
    const avant = { icones: icons.length, tous: a.system.modificateurs.tousTests };
    icons[0]?.click();
    await new Promise(r => setTimeout(r, 1000));
    return { tokenId: t.id, avant, apres: { tous: a.system.modificateurs.tousTests, statut: a.statuses.has("terrorise") } };
  }, ids.pj);
  ok("panneau d'effets : Terrorisé affiché, puis retiré au clic", pan.avant.icones === 1 && pan.avant.tous === -3 && pan.apres.tous === 0 && !pan.apres.statut, JSON.stringify(pan));

  // 7. Initiative lancée depuis le suivi de combat
  const ini = await page.evaluate(async ({ pjTok, pnjTok, pj }) => {
    const combat = await Combat.create({ scene: canvas.scene.id });
    const [cPj, cPnj] = await combat.createEmbeddedDocuments("Combatant", [
      { tokenId: pjTok, sceneId: canvas.scene.id }, { tokenId: pnjTok, sceneId: canvas.scene.id }]);
    const fixe = async c => { const r = c.getInitiativeRoll(); await r.evaluate(); return r.total - r.dice[0].total; };
    const out = { combatId: combat.id, base: await fixe(cPj) };
    await game.actors.get(pj).toggleStatusEffect("terrorise", { active: true });
    await new Promise(r => setTimeout(r, 300));
    out.terrorise = await fixe(cPj);
    out.pnjEndormi = await fixe(cPnj);   // Endormi : CA seulement, pas l'initiative
    await combat.rollInitiative([cPj.id, cPnj.id]);
    out.lances = [cPj.initiative, cPnj.initiative].every(v => Number.isFinite(v));
    await game.actors.get(pj).toggleStatusEffect("terrorise", { active: false });
    return out;
  }, { pjTok: pan.tokenId, pnjTok: unl.tokenId, pj: ids.pj });
  ok("initiative du suivi de combat : Terrorisé −3", ini.terrorise === ini.base - 3, `${ini.base} → ${ini.terrorise}`);
  ok("initiative du suivi de combat : jeton de PNJ Endormi inchangé (2)", ini.pnjEndormi === 2, ini.pnjEndormi);
  ok("« Lancer l'initiative » du suivi de combat fonctionne", ini.lances);
  ids.combat = ini.combatId;
  await page.evaluate(id => game.combats.get(id)?.delete(), ids.combat);
} catch (e) {
  ko++;
  res.push("ERREUR " + e.stack);
} finally {
  if (page) {
    try {
      const left = await page.evaluate(async msgIds => {
        for (const c of game.combats.filter(c => c.combatants.some(x => x.name?.startsWith("[TEST]")))) await c.delete();
        for (const t of canvas.scene?.tokens.filter(t => t.name.startsWith("[TEST]")) ?? []) await t.delete();
        const extra = game.messages.filter(m => m.speaker?.alias?.startsWith("[TEST]")).map(m => m.id);
        await ChatMessage.deleteDocuments([...new Set([...msgIds, ...extra])].filter(i => game.messages.get(i)));
        for (const a of game.actors.filter(a => a.name.startsWith("[TEST]"))) await a.delete();
        return { acteurs: game.actors.filter(a => a.name.startsWith("[TEST]")).length,
                 jetons: canvas.scene?.tokens.filter(t => t.name.startsWith("[TEST]")).length,
                 messages: game.messages.filter(m => m.speaker?.alias?.startsWith("[TEST]")).length };
      }, msgIds);
      res.push("nettoyage : " + JSON.stringify(left));
    } catch (e) { res.push("nettoyage ERREUR " + e.message); }
  }
  await browser.close();
  console.log(res.join("\n"));
  console.log(`\n${res.filter(r => r.startsWith("OK")).length} OK, ${ko} KO`);
  console.log("erreurs page :", JSON.stringify(errors, null, 1));
}
