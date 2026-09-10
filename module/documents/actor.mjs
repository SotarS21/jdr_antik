import { buildAttackFlavor, buildSaveFlavor } from "../helpers/rolls.mjs";
import { isOrphanedTokenActor } from "../helpers/actor-utils.mjs";
import { refreshSheet } from "../helpers/sheet-utils.mjs";

/** Fixed, deterministic ID for the "Avantage Temporaire" ActiveEffect (must be
 *  exactly 16 chars). Foundry rejects creating a document whose _id already
 *  exists in the collection, so this makes duplicate creation impossible at
 *  the database level regardless of how many times _onUpdate is re-entered. */
const AVANTAGE_TEMP_EFFECT_ID = "avantageTempEff1";

export class AntiqueActor extends Actor {

  /** Actor IDs currently syncing their "Avantage Temporaire" effect, to avoid
   *  redundant create/delete attempts when _onUpdate re-enters concurrently. */
  static #syncingAvantageTemporaire = new Set();

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    // Derived data is computed in the DataModel's prepareDerivedData()
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    // Expose initiative as a flat number for both actor types
    if (this.type === "character") {
      data.init = this.system.initiative ?? 0;
    } else if (this.type === "npc") {
      data.init = this.system.initiative?.value ?? 0;
    }
    return data;
  }

  /** @override */
  async _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);

    // Sync "Avantage Temporaire" ActiveEffect on the token when the boolean changes
    if (changed.system?.avantageTemporaire !== undefined && game.user.id === userId) {
      // A synthetic token-actor whose Token was deleted from its scene can no longer
      // resolve embedded-document operations — skip rather than crash.
      if (isOrphanedTokenActor(this)) return;

      // _onUpdate can fire twice for the same change (local + server echo); a second
      // concurrent run would see no ActiveEffect yet and create a duplicate.
      if (AntiqueActor.#syncingAvantageTemporaire.has(this.id)) return;
      AntiqueActor.#syncingAvantageTemporaire.add(this.id);

      try {
        const isActive = changed.system.avantageTemporaire;
        const existing = this.effects.get(AVANTAGE_TEMP_EFFECT_ID);

        if (isActive && !existing) {
          await this.createEmbeddedDocuments("ActiveEffect", [{
            _id: AVANTAGE_TEMP_EFFECT_ID,
            name: game.i18n.localize("ANTIQUE.Traits.AvantageTemporaire"),
            icon: "icons/svg/angel.svg",
            statuses: ["avantageTemporaire"]
          }], { keepId: true });
        } else if (!isActive && existing) {
          await this.deleteEmbeddedDocuments("ActiveEffect", [AVANTAGE_TEMP_EFFECT_ID]);
        }
        // The render this._onUpdate's caller triggers (e.g. the sheet's own
        // submitOnChange force-render) can fire before this async create/delete
        // above has resolved — refresh again now that it actually has.
        refreshSheet(this);
      } catch (err) {
        console.warn("Antique | Synchronisation de l'ActiveEffect \"Avantage Temporaire\" impossible :", err);
      } finally {
        AntiqueActor.#syncingAvantageTemporaire.delete(this.id);
      }
    }
  }

  /**
   * Roll an attack category check.
   * @param {string} catKey - The weapon category key (mainNue, armeBlanche, etc.)
   */
  async rollAttackCategory(catKey) {
    const cat = this.system.attackBonuses[catKey];
    if (!cat) return;
    const label = game.i18n.localize(CONFIG.ANTIQUE.weaponCategories[catKey]?.label ?? catKey);
    const roll = new Roll("1d20 + @total", { total: cat.total });
    await roll.evaluate();
    const flavor = buildAttackFlavor(`${label} - Jet d'attaque`, roll.total);
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor
    });
    return roll;
  }

  /**
   * Roll an ability check.
   * @param {string} abilityKey - The ability key (for, dex, con, int, ast, cha)
   */
  async rollAbility(abilityKey) {
    const ability = this.system.abilities[abilityKey];
    if (!ability) return;
    const label = game.i18n.localize(`ANTIQUE.Ability.${abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)}`);
    const roll = new Roll("1d20 + @mod", { mod: ability.mod });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} - Jet de caractéristique`
    });
    return roll;
  }

  /**
   * Roll a skill check.
   * @param {string} skillKey - The skill key
   */
  async rollSkill(skillKey) {
    const skill = this.system.skills[skillKey];
    if (!skill) return;
    const label = game.i18n.localize(CONFIG.ANTIQUE.skills[skillKey]?.label ?? skillKey);
    const roll = new Roll("1d20 + @total", { total: skill.total });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} - Jet de compétence`
    });
    return roll;
  }

  /**
   * Roll an Esquive/Parade reaction (see rules: anyone, PJ or PNJ, may attempt one when
   * targeted by an attack that would hit; whether it succeeds or not, it costs -1 to that
   * same skill for the rest of this actor's turn, stacking each use — reset to 0 at the
   * start of this actor's next turn by registerDodgeResetHook()). Works for both actor
   * types: a character reads/writes system.skills.<key>, a PNJ (no skill system) reads/
   * writes the flat system.<key> added specifically for this (AntiqueNpc).
   * @param {"esquive"|"parade"} skillKey
   */
  async rollDodgeSkill(skillKey) {
    const isCharacter = this.type === "character";
    const data = isCharacter ? this.system.skills[skillKey] : this.system[skillKey];
    if (!data) return;
    const path = isCharacter ? `system.skills.${skillKey}` : `system.${skillKey}`;
    const label = game.i18n.localize(CONFIG.ANTIQUE.skills[skillKey]?.label ?? skillKey);
    const roll = new Roll("1d20 + @total", { total: data.total });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} - ${game.i18n.localize("ANTIQUE.Dodge.ReactionFlavor")}`
    });
    await this.update({ [`${path}.tempPenalty`]: (data.tempPenalty ?? 0) - 1 });
    refreshSheet(this);
    return roll;
  }

  /**
   * Roll a save.
   * @param {string} saveKey - The save key (reflexes, robustesse, volonte)
   * @param {number} [dc=0] - Optional difficulty to beat (ex. a monster ability's chat
   *   button, "Robustesse DC 18") — shows a success/failure result under the roll. 0 = no
   *   comparison, same plain roll as before.
   */
  async rollSave(saveKey, dc = 0) {
    const saveConfig = CONFIG.ANTIQUE.saves[saveKey];
    // NPCs have no system.saves block at all (no skill/save system, see actor-npc.mjs) —
    // fall back to the better of the two abilities tied to this save, same simplified
    // "flat number" spirit as their attackBonuses table.
    const total = this.type === "npc"
      ? Math.max(...(saveConfig?.abilities ?? []).map(a => this.system.abilities?.[a]?.mod ?? 0))
      : this.system.saves?.[saveKey]?.total;
    if (total === undefined) return;
    const label = game.i18n.localize(saveConfig?.label ?? saveKey);
    const roll = new Roll("1d20 + @total", { total });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: buildSaveFlavor(`${label} - Jet de sauvegarde`, roll.total, dc)
    });
    return roll;
  }

  /**
   * Roll initiative and integrate with the Foundry combat tracker.
   * Adds the actor as a combatant if not already in combat, then rolls.
   */
  async rollInitiativeAntique() {
    // If no active combat exists, fall back to a simple chat roll
    if (!game.combat) {
      const rollData = this.getRollData();
      const roll = new Roll(CONFIG.Combat.initiative.formula, rollData);
      await roll.evaluate();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${this.name} - Initiative`
      });
      return roll;
    }
    // Use Foundry's built-in initiative system (adds to tracker)
    return this.rollInitiative({ createCombatants: true });
  }

  /**
   * Apply damage to this actor, reducing PV (minimum 0).
   * @param {number} amount - The amount of damage to apply
   * @returns {Promise<{before: number, after: number, amount: number}>}
   */
  async applyDamage(amount) {
    const current = this.system.pv.value;
    const newPv = Math.max(0, current - amount);
    await this.update({ "system.pv.value": newPv });

    // Native Foundry status, not a homemade schema field (see the "Avantage Temporaire"
    // anti-pattern above — CONFIG.statusEffects/toggleStatusEffect is the right tool here).
    const isDead = this.statuses.has("dead");
    if (newPv <= 0 && !isDead) await this.toggleStatusEffect("dead", { active: true });
    else if (newPv > 0 && isDead) await this.toggleStatusEffect("dead", { active: false });

    // Invoked from a chat message button (antique.mjs), not this actor's own sheet
    // form — nothing else refreshes an already-open sheet for the damaged actor.
    refreshSheet(this);

    return { before: current, after: newPv, amount };
  }

  /**
   * Apply healing to this actor, raising PV (capped at max) — mirror of applyDamage().
   * @param {number} amount - The amount of HP to restore
   * @returns {Promise<{before: number, after: number, amount: number}>}
   */
  async applyHeal(amount) {
    const current = this.system.pv.value;
    const max = this.system.pv.max;
    const newPv = Math.min(max, current + amount);
    await this.update({ "system.pv.value": newPv });

    const isDead = this.statuses.has("dead");
    if (newPv > 0 && isDead) await this.toggleStatusEffect("dead", { active: false });

    refreshSheet(this);

    return { before: current, after: newPv, amount };
  }

  /**
   * Apply a temporary CA bonus ActiveEffect to this actor (e.g. a buff spell like
   * "Peau d'écorce"), via `system.ca.temp` — the same field the CA block's manual
   * "Temp" input already writes to, so the two stack rather than conflict.
   * Re-applying the same `name` refreshes the existing effect instead of stacking
   * duplicates (same idiom as the "Affamé" effect in longRest()).
   * @param {number} amount
   * @param {{name: string, icon?: string}} options
   * @returns {Promise<{before: number, after: number, amount: number}>}
   */
  async applyCaBonus(amount, { name, icon = "icons/svg/upgrade.svg" }) {
    const before = this.system.ca.total;
    const changes = [{ key: "system.ca.temp", mode: 2, value: String(amount) }];

    const existing = this.effects.find(e => e.name === name);
    if (existing) await existing.update({ changes });
    else await this.createEmbeddedDocuments("ActiveEffect", [{ name, icon, changes, transfer: true }]);

    const after = this.system.ca.total;

    // Same reasoning as applyDamage(): invoked from a chat message button, so this
    // actor's own sheet (if open) needs an explicit refresh.
    refreshSheet(this);

    return { before, after, amount };
  }

  /**
   * Perform a long rest: restore HP, consume a ration, manage "Affamé" effect.
   */
  async longRest() {
    const pvBefore = this.system.pv.value;
    const pvMax = this.system.pv.max;
    const pvHealed = pvMax - pvBefore;

    // Look for a consumable ration in inventory
    const ration = this.items.find(i =>
      i.type === "equipment"
      && i.system.consumable
      && i.name.toLowerCase().includes("ration")
      && i.system.quantity > 0
    );

    let rationConsumed = false;
    let starving = false;

    if (ration) {
      // Consume 1 ration
      await ration.update({ "system.quantity": ration.system.quantity - 1 });
      refreshSheet(ration);
      rationConsumed = true;

      // Remove "Affamé" effect if present
      const starvingEffect = this.effects.find(e => e.name === game.i18n.localize("ANTIQUE.Rest.Starving"));
      if (starvingEffect) {
        await this.deleteEmbeddedDocuments("ActiveEffect", [starvingEffect.id]);
      }
    } else {
      starving = true;
      // Apply "Affamé" effect if not already present
      const effectName = game.i18n.localize("ANTIQUE.Rest.Starving");
      const existing = this.effects.find(e => e.name === effectName);
      if (!existing) {
        await this.createEmbeddedDocuments("ActiveEffect", [{
          name: effectName,
          icon: "icons/svg/downgrade.svg",
          changes: [
            { key: "system.abilities.for.mod", mode: 2, value: "-2" },
            { key: "system.abilities.con.mod", mode: 2, value: "-1" }
          ],
          transfer: true
        }]);
      }
    }

    // Restore HP to max
    const updateData = { "system.pv.value": pvMax };

    // Restore PM to max if magic practitioner
    const pmBefore = this.system.pm?.value ?? 0;
    const pmMax = this.system.pm?.max ?? 0;
    let pmRestored = false;
    if (this.system.isMagicPractitioner && pmMax > 0 && pmBefore < pmMax) {
      updateData["system.pm.value"] = pmMax;
      pmRestored = true;
    }

    await this.update(updateData);

    // A long rest restores PV to max — a character healed back up should never stay
    // marked "dead" (see the equivalent toggle in applyDamage()).
    if (this.statuses.has("dead")) await this.toggleStatusEffect("dead", { active: false });

    // Reset spell limitations
    let spellsReset = 0;
    const spells = this.items.filter(i => i.type === "spell" && i.system.limitation > 0);
    for (const spell of spells) {
      if (spell.system.limitationValue < spell.system.limitation) {
        await spell.update({ "system.limitationValue": spell.system.limitation });
        refreshSheet(spell);
        spellsReset++;
      }
    }

    // Post chat message
    const parts = [`<b>${this.name}</b> ${game.i18n.localize("ANTIQUE.Rest.Success")}.`];
    parts.push(`PV : ${pvBefore} → ${pvMax} (+${pvHealed})`);
    if (rationConsumed) {
      parts.push(`<i class="fas fa-utensils"></i> ${game.i18n.localize("ANTIQUE.Rest.RationConsumed")} (${ration.name})`);
    }
    if (starving) {
      parts.push(`<i class="fas fa-exclamation-triangle"></i> <strong>${game.i18n.localize("ANTIQUE.Rest.NoRation")}</strong>`);
    }
    if (pmRestored) {
      parts.push(`<i class="fas fa-hat-wizard"></i> ${game.i18n.localize("ANTIQUE.PM")} : ${pmBefore} → ${pmMax} (${game.i18n.localize("ANTIQUE.Rest.PMReset")})`);
    }
    if (spellsReset > 0) {
      parts.push(`<i class="fas fa-magic"></i> ${game.i18n.localize("ANTIQUE.Rest.SpellsReset")}`);
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<div class="antique rest-message">${parts.join("<br>")}</div>`
    });
  }
}
