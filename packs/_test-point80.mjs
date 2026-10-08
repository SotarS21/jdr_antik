// Test en direct du point 80 (statuts classiques, modificateur « tous les tests », compétences
// des PNJ) — monde testantique, compte MJ « Gamemaster ». Ne crée que des acteurs « [TEST] » et
// leurs messages, tous supprimés à la fin ; n'applique aucun correctif de compendium.
// Usage : node packs/_test-point80.mjs [dossier des captures]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const OUT = process.argv[2] ?? ".";
const npx = path.join(execSync("npm config get cache").toString().trim(), "_npx");
const pw = fs.readdirSync(npx).map(d => path.join(npx, d, "node_modules", "playwright", "index.mjs")).find(f => fs.existsSync(f));
const { chromium } = await import(pathToFileURL(pw).href);

// Liste validée (document « Antique — effets classiques et compétences des PNJ »).
const SPEC = {
  peur:        { tousTests: -1 },
  terrorise:   { tousTests: -3 },
  etourdi:     { tousTests: -2, ca: -2 },
  aveugle:     { attaque: -4, ca: -2 },
  aTerre:      { attaque: -2, ca: -2 },
  entrave:     { esquive: -2, deplacement0: true },
  empoisonne:  { tousTests: -1 },
  saignement:  {},
  endormi:     { ca: -4 },
  inconscient: { ca: -4 },
  beni:        { tousTests: 1 }
};

const browser = await chromium.launch();
const res = [];
const errors = [];
let ko = 0;
const ok = (name, cond, detail = "") => { if (!cond) ko++; res.push(`${cond ? "OK" : "KO"} ${name}${detail !== "" ? " — " + detail : ""}`); };
let page;
const msgIds = [];
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
  await page.waitForTimeout(3000);
  // Ferme les fenêtres ouvertes automatiquement (notes de version, correctifs) sans rien appliquer.
  await page.evaluate(() => { for (const app of foundry.applications.instances.values()) if (app.id !== "sidebar" && app.options?.window) try { app.close(); } catch {} });

  // 1. Statuts dans le menu du jeton
  const se = await page.evaluate(() => ({
    ids: CONFIG.statusEffects.map(s => s.id),
    peur: CONFIG.statusEffects.find(s => s.id === "peur")
  }));
  ok("11 statuts Antique ajoutés au menu du jeton", Object.keys(SPEC).every(id => se.ids.includes(id)), se.ids.length + " statuts");
  ok("statuts de Foundry conservés (dead, blind, prone…)", ["dead", "blind", "prone", "unconscious"].every(i => se.ids.includes(i)));
  ok("description traduite", /−1 à tous les tests/.test(se.peur?.description ?? ""), se.peur?.description);

  // 2. Acteurs de test
  const ids = await page.evaluate(async () => {
    const pj = await Actor.create({ name: "[TEST] PJ statuts", type: "character" });
    const [arme] = await pj.createEmbeddedDocuments("Item", [{ name: "[TEST] Glaive", type: "weapon", system: { attBonus: 1, category: "armeBlanche" } }]);
    const pnj = await Actor.create({ name: "[TEST] PNJ statuts", type: "npc",
      system: { ca: { value: 13 }, attaque: { value: 4 }, esquive: { value: 2 }, initiative: { value: 3 }, deplacement: 9,
                abilities: { for: { value: 14 }, dex: { value: 12 } } } });
    return { pj: pj.id, arme: arme.id, pnj: pnj.id };
  });

  /** Mesure : valeurs dérivées + partie fixe de chaque type de jet (1d20 + X). */
  const measure = (id, isPJ) => page.evaluate(async ({ id, isPJ, armeId }) => {
    const a = game.actors.get(id);
    const fixed = r => r.total - r.dice[0].total;
    const ids = [];
    const keep = async r => { ids.push(game.messages.contents.at(-1).id); return fixed(r); };
    const out = {
      mods: { ...a.system.modificateurs },
      ca: isPJ ? a.system.ca.total : a.system.ca.value,
      esquive: isPJ ? a.system.skills.esquive.total : a.system.esquive.total,
      deplacement: a.system.deplacement,
      init: a.getRollData().init
    };
    out.carac = await keep(await a.rollAbility("dex"));
    out.sauvegarde = await keep(await a.rollSave("reflexes"));
    if (isPJ) {
      out.competence = await keep(await a.rollSkill("athletisme"));
      out.attaqueCat = await keep(await a.rollAttackCategory("armeBlanche"));
      out.arme = await keep(await a.items.get(armeId)._executeAttackRoll("melee"));
    } else {
      // Attaque du PNJ : même calcul que _rollNpcAttack (fiche)
      await a.sheet._rollNpcAttack();
      const m = game.messages.contents.at(-1); ids.push(m.id);
      out.arme = m.rolls[0].total - m.rolls[0].dice[0].total;
    }
    out.flavor = game.messages.contents.at(-1).flavor;
    out.msgIds = ids;
    return out;
  }, { id, isPJ, armeId: ids.arme });

  for (const [label, id, isPJ] of [["PJ", ids.pj, true], ["PNJ", ids.pnj, false]]) {
    const base = await measure(id, isPJ);
    msgIds.push(...base.msgIds);
    ok(`${label} : modificateurs à 0 sans statut`, Object.values(base.mods).every(v => v === 0), JSON.stringify(base.mods));
    for (const [statut, spec] of Object.entries(SPEC)) {
      await page.evaluate(({ id, s }) => game.actors.get(id).toggleStatusEffect(s, { active: true }), { id, s: statut });
      await page.waitForTimeout(250);
      const m = await measure(id, isPJ);
      msgIds.push(...m.msgIds);
      const t = spec.tousTests ?? 0, att = spec.attaque ?? 0;
      const exp = {
        ca: base.ca + (spec.ca ?? 0),
        esquive: base.esquive + (spec.esquive ?? 0),
        deplacement: spec.deplacement0 ? 0 : base.deplacement,
        init: base.init + t,
        carac: base.carac + t,
        sauvegarde: base.sauvegarde + t,
        arme: base.arme + t + att
      };
      if (isPJ) Object.assign(exp, { competence: base.competence + t, attaqueCat: base.attaqueCat + t + att });
      const diffs = Object.keys(exp).filter(k => m[k] !== exp[k]).map(k => `${k} ${m[k]}≠${exp[k]}`);
      ok(`${label} ${statut}`, diffs.length === 0, diffs.join(", "));
      const needFlavor = t !== 0 || att !== 0;
      if (needFlavor) ok(`${label} ${statut} : détail dans le tchat`, /antique-roll-mods/.test(m.flavor ?? ""), (m.flavor ?? "").replace(/<[^>]+>/g, "").slice(0, 90));
      await page.evaluate(({ id, s }) => game.actors.get(id).toggleStatusEffect(s, { active: false }), { id, s: statut });
      await page.waitForTimeout(250);
      const back = await measure(id, isPJ);
      msgIds.push(...back.msgIds);
      const d2 = ["ca", "esquive", "deplacement", "init", "carac", "sauvegarde", "arme"].filter(k => back[k] !== base[k]);
      ok(`${label} ${statut} retiré → normal`, d2.length === 0, d2.join(","));
    }
    // Cumul : Peur + Béni + Étourdi
    for (const s of ["peur", "beni", "etourdi"]) await page.evaluate(({ id, s }) => game.actors.get(id).toggleStatusEffect(s, { active: true }), { id, s });
    await page.waitForTimeout(300);
    const c = await measure(id, isPJ);
    msgIds.push(...c.msgIds);
    ok(`${label} cumul Peur + Béni + Étourdi : −2 aux tests, −2 CA`, c.carac === base.carac - 2 && c.ca === base.ca - 2, `carac ${c.carac} (base ${base.carac}), CA ${c.ca}`);
    ok(`${label} cumul : chaque statut détaillé`, /Peur/.test(c.flavor) && /Béni/.test(c.flavor) && /Étourdi/.test(c.flavor), c.flavor.replace(/<[^>]+>/g, "").slice(0, 120));
    for (const s of ["peur", "beni", "etourdi"]) await page.evaluate(({ id, s }) => game.actors.get(id).toggleStatusEffect(s, { active: false }), { id, s });
    // Remise à zéro des pénalités d'esquive (aucun jet d'esquive ici, par sécurité)
  }

  // 3. Valeur saisie de la CA du PNJ jamais modifiée par un statut
  const caSrc = await page.evaluate(async id => {
    const a = game.actors.get(id);
    await a.toggleStatusEffect("endormi", { active: true });
    const r = { source: a._source.system.ca.value, effective: a.system.ca.value };
    await a.toggleStatusEffect("endormi", { active: false });
    return r;
  }, ids.pnj);
  ok("PNJ Endormi : CA saisie 13 inchangée, effective 9", caSrc.source === 13 && caSrc.effective === 9, JSON.stringify(caSrc));

  // 4. Compétences du PNJ : interface
  await page.evaluate(id => game.actors.get(id).sheet.render(true), ids.pnj);
  const S = ".antique.npc";
  await page.waitForSelector(`${S} .npc-competence-add`, { state: "attached" });
  await page.click(`${S} .sheet-tabs .item[data-tab="stats"]`);
  await page.waitForSelector(`${S} .npc-competence-add`);
  ok("PNJ sans compétence : message vide", await page.locator(`${S} .npc-competences-vide`).count() === 1);
  const addSkill = async value => {
    await page.click(`${S} .npc-competence-add`);
    await page.waitForSelector("dialog select[name=cle], .application.dialog select[name=cle]");
    await page.selectOption("select[name=cle]", value);
    await page.click(".application.dialog button[data-action=ok], dialog button[data-action=ok]");
    await page.waitForTimeout(1200);
  };
  await addSkill("athletisme");
  await addSkill("");
  const comp = await page.evaluate(id => {
    const a = game.actors.get(id);
    return { list: a.system.competences.map(c => ({ ...c })), forMod: a.system.abilities.for.mod,
             athlAbility: CONFIG.ANTIQUE.skills.athletisme.ability, mod: a.system.abilities[CONFIG.ANTIQUE.skills.athletisme.ability].mod };
  }, ids.pnj);
  ok("ajout d'une compétence de PJ (Athlétisme) : caractéristique liée, total prérempli",
    comp.list[0]?.cle === "athletisme" && comp.list[0].caracteristique === comp.athlAbility && comp.list[0].total === comp.mod, JSON.stringify(comp.list[0]));
  ok("ajout d'une compétence personnalisée", comp.list[1]?.cle === "" && comp.list[1].nom === "Compétence personnalisée" && comp.list[1].total === comp.forMod, JSON.stringify(comp.list[1]));
  // Saisie du total et du nom (soumission du formulaire de la fiche)
  await page.fill(`${S} input[name="system.competences.0.total"]`, "7");
  await page.press(`${S} input[name="system.competences.0.total"]`, "Tab");
  await page.waitForTimeout(1200);
  await page.fill(`${S} input[name="system.competences.1.nom"]`, "Pêche en apnée");
  await page.press(`${S} input[name="system.competences.1.nom"]`, "Tab");
  await page.waitForTimeout(1200);
  const comp2 = await page.evaluate(id => game.actors.get(id).system.competences.map(c => ({ ...c })), ids.pnj);
  ok("total saisi enregistré, liste intacte", comp2.length === 2 && comp2[0].total === 7 && comp2[0].cle === "athletisme" && comp2[1].cle === "", JSON.stringify(comp2));
  ok("nom de la compétence personnalisée enregistré", comp2[1]?.nom === "Pêche en apnée", comp2[1]?.nom);
  // Jet d'une compétence avec Peur
  await page.evaluate(id => game.actors.get(id).toggleStatusEffect("peur", { active: true }), ids.pnj);
  await page.waitForTimeout(800);
  await page.click(`${S} .npc-competence-roll[data-index="0"] >> nth=0`);
  await page.waitForTimeout(1200);
  const jet = await page.evaluate(() => { const m = game.messages.contents.at(-1); return { id: m.id, fixe: m.rolls[0].total - m.rolls[0].dice[0].total, flavor: m.flavor }; });
  msgIds.push(jet.id);
  ok("jet de compétence du PNJ : 1d20 + 7 − 1 (Peur)", jet.fixe === 6, `${jet.fixe} — ${jet.flavor.replace(/<[^>]+>/g, "")}`);
  await page.screenshot({ path: `${OUT}/p80-pnj.png`, clip: await page.locator(`form${S}`).boundingBox() });
  await page.evaluate(id => game.actors.get(id).toggleStatusEffect("peur", { active: false }), ids.pnj);
  await page.waitForTimeout(800);
  // Suppression
  await page.click(`${S} .npc-competence-delete[data-index="0"]`);
  await page.waitForTimeout(1200);
  const comp3 = await page.evaluate(id => game.actors.get(id).system.competences.map(c => ({ ...c })), ids.pnj);
  ok("corbeille : compétence retirée, l'autre gardée", comp3.length === 1 && comp3[0].nom === "Pêche en apnée", JSON.stringify(comp3));

  // 5. Jeton : icône du statut + panneau d'effets
  const tok = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const [t] = await canvas.scene.createEmbeddedDocuments("Token", [(await a.getTokenDocument({ x: canvas.stage.pivot.x, y: canvas.stage.pivot.y })).toObject()]);
    await t.actor.toggleStatusEffect("aTerre", { active: true });
    await new Promise(r => setTimeout(r, 800));
    t.object?.control({ releaseOthers: true });
    await new Promise(r => setTimeout(r, 800));
    const e = t.actor.effects.find(x => x.statuses.has("aTerre"));
    return { tokenId: t.id, showIcon: e?.showIcon === CONST.ACTIVE_EFFECT_SHOW_ICON.ALWAYS,
             panel: document.querySelectorAll("#antique-effects-panel .antique-effects-panel-icon").length };
  }, ids.pnj);
  ok("statut À terre : icône sur le jeton", tok.showIcon);
  ok("statut visible dans le panneau d'effets", tok.panel >= 1, tok.panel);
  await page.evaluate(id => canvas.scene.tokens.get(id)?.delete(), tok.tokenId);
} catch (e) {
  ko++;
  res.push("ERREUR " + e.stack);
} finally {
  if (page) {
    try {
      const left = await page.evaluate(async msgIds => {
        for (const t of canvas.scene?.tokens.filter(t => t.name.startsWith("[TEST]")) ?? []) await t.delete();
        await ChatMessage.deleteDocuments(msgIds.filter(i => game.messages.get(i)));
        for (const a of game.actors.filter(a => a.name.startsWith("[TEST]"))) await a.delete();
        return { acteurs: game.actors.filter(a => a.name.startsWith("[TEST]")).length,
                 messages: msgIds.filter(i => game.messages.get(i)).length };
      }, msgIds);
      res.push("nettoyage : " + JSON.stringify(left));
    } catch (e) { res.push("nettoyage ERREUR " + e.message); }
  }
  await browser.close();
  console.log(res.join("\n"));
  console.log(`\n${res.filter(r => r.startsWith("OK")).length} OK, ${ko} KO`);
  console.log("erreurs page :", JSON.stringify(errors, null, 1));
}
