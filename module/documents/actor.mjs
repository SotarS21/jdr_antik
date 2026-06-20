import { buildAttackFlavor } from "../helpers/rolls.mjs";

export class AntiqueActor extends Actor {

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
      const isActive = changed.system.avantageTemporaire;
      const existing = this.effects.find(e => e.statuses.has("avantageTemporaire"));

      if (isActive && !existing) {
        await this.createEmbeddedDocuments("ActiveEffect", [{
          name: "Avantage Temporaire",
          icon: "icons/svg/angel.svg",
          statuses: ["avantageTemporaire"]
        }]);
      } else if (!isActive && existing) {
        await this.deleteEmbeddedDocuments("ActiveEffect", [existing.id]);
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
   * Roll a save.
   * @param {string} saveKey - The save key (reflexes, robustesse, volonte)
   */
  async rollSave(saveKey) {
    const save = this.system.saves[saveKey];
    if (!save) return;
    const label = game.i18n.localize(CONFIG.ANTIQUE.saves[saveKey]?.label ?? saveKey);
    const roll = new Roll("1d20 + @total", { total: save.total });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} - Jet de sauvegarde`
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
    return { before: current, after: newPv, amount };
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

    // Reset spell limitations
    let spellsReset = 0;
    const spells = this.items.filter(i => i.type === "spell" && i.system.limitation > 0);
    for (const spell of spells) {
      if (spell.system.limitationValue < spell.system.limitation) {
        await spell.update({ "system.limitationValue": spell.system.limitation });
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
