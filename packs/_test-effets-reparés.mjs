// Test en direct des corrections v0.6.152 (constats annexes du point 80) — monde testantique,
// compte MJ « Gamemaster ». Ne crée que des acteurs « [TEST] » (supprimés à la fin) ; ne modifie
// ni les compendiums ni les personnages du monde (les correctifs restent à cocher par le MJ).
// Usage : node "packs/_test-effets-reparés.mjs"
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const npx = path.join(execSync("npm config get cache").toString().trim(), "_npx");
const pw = fs.readdirSync(npx).map(d => path.join(npx, d, "node_modules", "playwright", "index.mjs")).find(f => fs.existsSync(f));
const { chromium } = await import(pathToFileURL(pw).href);

// Ancienne version de Xeno (avant correction de la source) pour tester le correctif sur une copie.
const xenoAncien = execSync("git show HEAD:packs/personnages.db", { cwd: ROOT }).toString()
  .split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l)).find(d => d.name === "Xeno");

const res = [];
const errors = [];
let ko = 0;
const ok = (name, cond, detail = "") => { if (!cond) ko++; res.push(`${cond ? "OK" : "KO"} ${name}${detail !== "" ? " — " + detail : ""}`); };
const browser = await chromium.launch();
let page;
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
  await page.evaluate(() => { for (const app of foundry.applications.instances.values()) if (app.id !== "sidebar" && app.options?.window) try { app.close(); } catch {} });

  ok("classe d'effet Antique active", await page.evaluate(() => CONFIG.ActiveEffect.documentClass.name) === "AntiqueActiveEffect");

  // Instantané des valeurs dépendantes
  const snap = id => page.evaluate(id => {
    const s = game.actors.get(id).system;
    const o = { ca: s.ca?.total ?? s.ca?.value, init: game.actors.get(id).getRollData().init };
    for (const k of Object.keys(s.abilities)) o[`mod.${k}`] = s.abilities[k].mod;
    if (s.saves) for (const k of Object.keys(s.saves)) o[`save.${k}`] = s.saves[k].total;
    if (s.skills) { o["skill.athletisme"] = s.skills.athletisme?.total; o["skill.armeBlanche"] = s.skills.armeBlanche?.total;
      o["skill.vigilance"] = s.skills.vigilance?.total; o["skill.vigueur"] = s.skills.vigueur?.total; }
    if (s.attackBonuses) o["atk.armeBlanche"] = s.attackBonuses.armeBlanche?.total;
    return o;
  }, id);
  const diff = (a, b) => Object.fromEntries(Object.keys(a).filter(k => a[k] !== b[k]).map(k => [k, b[k] - a[k]]));
  const fromPack = (id, pack, name) => page.evaluate(async ({ id, pack, name }) => {
    const p = game.packs.get(`antique.${pack}`);
    const entry = (await p.getIndex()).find(e => e.name === name);
    const doc = await p.getDocument(entry._id);
    const [it] = await game.actors.get(id).createEmbeddedDocuments("Item", [doc.toObject()]);
    await new Promise(r => setTimeout(r, 300));
    return it.id;
  }, { id, pack, name });
  const removeItem = (id, itemId) => page.evaluate(async ({ id, itemId }) => { await game.actors.get(id).items.get(itemId).delete(); await new Promise(r => setTimeout(r, 300)); }, { id, itemId });

  const ids = await page.evaluate(async () => {
    const pj = await Actor.create({ name: "[TEST] PJ réparé", type: "character",
      system: { abilities: { for: { value: 14 }, dex: { value: 13 }, con: { value: 12 }, int: { value: 12 }, cha: { value: 11 } },
                skills: { armeBlanche: { trained: true }, athletisme: { trained: true } } } });
    const pnj = await Actor.create({ name: "[TEST] PNJ réparé", type: "npc", system: { abilities: { cha: { value: 12 } } } });
    return { pj: pj.id, pnj: pnj.id };
  });

  // 1. Désavantages de sauvegarde
  const base = await snap(ids.pj);
  for (const [nom, save] of [["(1) Frêle", "robustesse"], ["(1) Dépressif", "volonte"], ["(1) Maladroit", "reflexes"]]) {
    const itemId = await fromPack(ids.pj, "desavantages", nom);
    const d = diff(base, await snap(ids.pj));
    ok(`${nom} : ${save} −1, rien d'autre`, JSON.stringify(d) === JSON.stringify({ [`save.${save}`]: -1 }), JSON.stringify(d));
    await removeItem(ids.pj, itemId);
    ok(`${nom} retiré → normal`, Object.keys(diff(base, await snap(ids.pj))).length === 0);
  }

  // 2. Bénédictions (modificateur de caractéristique) et répercussions
  for (const [nom, ab, v] of [["Force d'Héraclès", "for", 2], ["Vitesse d'Hermès", "dex", 2], ["Faveur d'Athéna", "int", 2], ["Beauté divine", "cha", 1]]) {
    const itemId = await fromPack(ids.pj, "benedictions", nom);
    const s = await snap(ids.pj);
    const d = diff(base, s);
    ok(`${nom} : modificateur ${ab} +${v}`, d[`mod.${ab}`] === v, JSON.stringify(d));
    if (ab === "for") ok(`${nom} : répercuté (Athlétisme, attaque Arme blanche)`, d["skill.armeBlanche"] === v && d["atk.armeBlanche"] === v, JSON.stringify(d));
    if (ab === "dex") ok(`${nom} : répercuté (sauvegarde Réflexes, initiative)`, d["save.reflexes"] === v && d.init === v, JSON.stringify(d));
    await removeItem(ids.pj, itemId);
    ok(`${nom} retiré → normal`, Object.keys(diff(base, await snap(ids.pj))).length === 0);
  }
  // Bénédiction sur un PNJ
  const bPnj = await snap(ids.pnj);
  const bd = await fromPack(ids.pnj, "benedictions", "Beauté divine");
  ok("PNJ Beauté divine : modificateur cha +1", diff(bPnj, await snap(ids.pnj))["mod.cha"] === 1, JSON.stringify(diff(bPnj, await snap(ids.pnj))));
  await removeItem(ids.pnj, bd);

  // Un effet déjà en phase "abilities" n'est pas compté deux fois
  const dbl = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const avant = a.system.abilities.for.mod;
    const [e] = await a.createEmbeddedDocuments("ActiveEffect", [{ name: "[TEST] +1 For (phase abilities)",
      system: { changes: [{ key: "system.abilities.for.mod", type: "add", value: "1", phase: "abilities" }] } }]);
    const apres = a.system.abilities.for.mod;
    await e.delete();
    return apres - avant;
  }, ids.pj);
  ok("effet déjà en phase « abilities » : appliqué une seule fois (+1)", dbl === 1, dbl);

  // 3. Affamé (repos long sans ration, créé par le code)
  const aff = await page.evaluate(async id => {
    const a = game.actors.get(id);
    const avant = { for: a.system.abilities.for.mod, con: a.system.abilities.con.mod, rob: a.system.saves.robustesse.total };
    await a.longRest();
    await new Promise(r => setTimeout(r, 800));
    const e = a.effects.find(x => /Affam/.test(x.name));
    const apres = { for: a.system.abilities.for.mod, con: a.system.abilities.con.mod, rob: a.system.saves.robustesse.total };
    const msgs = game.messages.contents.slice(-3).filter(m => m.speaker?.alias === a.name).map(m => m.id);
    await e?.delete();
    if (msgs.length) await ChatMessage.deleteDocuments(msgs);
    return { existe: !!e, changes: e?.system.changes.map(c => `${c.key} ${c.value}`), d: { for: apres.for - avant.for, con: apres.con - avant.con, rob: apres.rob - avant.rob } };
  }, ids.pj);
  ok("Affamé (repos sans ration) : For −2, Con −1, et la sauvegarde Robustesse suit", aff.existe && aff.d.for === -2 && aff.d.con === -1 && aff.d.rob === -3, JSON.stringify(aff));

  // 4. Correctif des effets invalides, sur une copie de l'ancienne Xeno (pas le monde)
  const rage = await page.evaluate(async xeno => {
    delete xeno._id;
    xeno.name = "[TEST] Xeno ancien";
    const a = await Actor.create(xeno);
    const r = a.items.find(i => i.name === "Rage");
    const avant = { caBonus: r.system.caBonus, keys: r.effects.contents.flatMap(e => e.system.changes.map(c => c.key)) };
    const { corrigerEffetsInvalidesActeur } = await import("/systems/antique/module/helpers/pack-updates.mjs");
    const n = await corrigerEffetsInvalidesActeur(a);
    const n2 = await corrigerEffetsInvalidesActeur(a);
    const r2 = a.items.find(i => i.name === "Rage");
    return { avant, n, n2, apres: { caBonus: r2.system.caBonus, keys: r2.effects.contents.flatMap(e => e.system.changes.map(c => c.key)),
             desc: r2.effects.contents[0]?.description ?? "" }, autres: a.items.size };
  }, xenoAncien);
  ok("Rage avant correction : clés « Dégats » / « Ca », caBonus 0", rage.avant.caBonus === 0 && rage.avant.keys.includes("Ca"), JSON.stringify(rage.avant));
  ok("Rage corrigée : caBonus 1, plus aucune clé invalide, +1d6 dans la description",
    rage.n === 1 && rage.apres.caBonus === 1 && rage.apres.keys.length === 0 && /1d6/.test(rage.apres.desc), JSON.stringify(rage.apres));
  ok("correctif rejoué : rien à faire (0)", rage.n2 === 0, rage.n2);

  // 5. Personnages du monde : lecture seule (le correctif monde est à cocher par le MJ)
  const monde = await page.evaluate(() => game.actors.filter(a => ["Xeno", "Eosyne"].includes(a.name)).map(a => a.name));
  res.push(`INFO personnages concernés présents dans le monde : ${monde.join(", ") || "aucun"} (non modifiés)`);
} catch (e) {
  ko++;
  res.push("ERREUR " + e.stack);
} finally {
  if (page) {
    try {
      const left = await page.evaluate(async () => {
        for (const a of game.actors.filter(a => a.name.startsWith("[TEST]"))) await a.delete();
        const msgs = game.messages.filter(m => m.speaker?.alias?.startsWith("[TEST]")).map(m => m.id);
        if (msgs.length) await ChatMessage.deleteDocuments(msgs);
        return { acteurs: game.actors.filter(a => a.name.startsWith("[TEST]")).length };
      });
      res.push("nettoyage : " + JSON.stringify(left));
    } catch (e) { res.push("nettoyage ERREUR " + e.message); }
  }
  await browser.close();
  console.log(res.join("\n"));
  console.log(`\n${res.filter(r => r.startsWith("OK")).length} OK, ${ko} KO`);
  console.log("erreurs page :", JSON.stringify(errors, null, 1));
}
