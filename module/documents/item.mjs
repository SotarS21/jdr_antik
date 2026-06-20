import { buildAttackFlavor } from "../helpers/rolls.mjs";

export class AntiqueItem extends Item {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /**
   * Roll an attack with this weapon.
   */
  async rollAttack() {
    if (this.type !== "weapon") return;

    // Consumable weapons: consume linked ammo
    if (this.system.consumable) {
      const linkedAmmo = this.system.linkedAmmoId && this.actor
        ? this.actor.items.get(this.system.linkedAmmoId)
        : null;

      if (linkedAmmo) {
        if (linkedAmmo.system.quantity <= 0) {
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: `<p><strong>${this.name}</strong> — ${game.i18n.localize("ANTIQUE.Weapon.NoAmmoLeft")} (${linkedAmmo.name})</p>`
          });
          return;
        }
        await linkedAmmo.update({ "system.quantity": linkedAmmo.system.quantity - 1 });
      }
    }

    const roll = new Roll("1d20 + @attBonus", { attBonus: this.system.attBonus });
    await roll.evaluate();
    const flavor = buildAttackFlavor(`${this.name} - Jet d'attaque`, roll.total);
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor
    });
    return roll;
  }

  /**
   * Roll damage with this weapon.
   */
  async rollDamage() {
    if (this.type !== "weapon") return;
    const roll = new Roll(this.system.damage);
    await roll.evaluate();
    const rollHTML = await roll.render();
    const applyLabel = game.i18n.format("ANTIQUE.Damage.ApplyButton", { amount: roll.total });
    const content = `
      <div class="antique damage-chat-card">
        <div class="damage-roll-result">${rollHTML}</div>
        <button type="button" class="apply-damage" data-damage="${roll.total}">
          <i class="fas fa-heart-broken"></i> ${applyLabel}
        </button>
      </div>`;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${this.name} - ${game.i18n.localize("ANTIQUE.Damage.Title")}`,
      content,
      rolls: [roll]
    });
    return roll;
  }

  /**
   * Post this item's summary (image, name, description) to the chat.
   * For spells, displays additional details (effect, cost, range, duration, etc.).
   */
  async postToChat() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });

    if (this.type === "spell") {
      const lines = [];
      if (this.system.effect) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Effect")} :</strong> <em>${this.system.effect}</em></div>`);
      }
      // Cost
      if (this.system.ritual && this.system.costText) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Cost")} :</strong> <i class="fas fa-mortar-pestle"></i> ${this.system.costText} (${game.i18n.localize("ANTIQUE.Spell.Ritual")})</div>`);
      } else if (this.system.cost) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Cost")} :</strong> ${this.system.cost} ${game.i18n.localize("ANTIQUE.PM")}</div>`);
      }
      if (this.system.range) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Range")} :</strong> ${this.system.range}</div>`);
      }
      if (this.system.duration) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Duration")} :</strong> ${this.system.duration}</div>`);
      }
      if (this.system.limitation > 0) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Limitation")} :</strong> ${this.system.limitationValue} / ${this.system.limitation}</div>`);
      }
      if (this.system.components) {
        lines.push(`<div class="spell-chat-detail"><strong>${game.i18n.localize("ANTIQUE.Spell.Components")} :</strong> ${this.system.components}</div>`);
      }
      const description = this.system.description ?? "";
      const content = `
        <div class="antique item-chat-card spell-chat-card">
          <header class="card-header">
            <img src="${this.img}" width="36" height="36" />
            <h3>${this.name}</h3>
          </header>
          ${lines.length ? `<div class="spell-chat-details">${lines.join("")}</div>` : ""}
          ${description ? `<div class="card-content">${description}</div>` : ""}
        </div>`;
      await ChatMessage.create({ speaker, content });
      return;
    }

    const description = this.system.description ?? "";
    const content = `
      <div class="antique item-chat-card">
        <header class="card-header">
          <img src="${this.img}" width="36" height="36" />
          <h3>${this.name}</h3>
        </header>
        ${description ? `<div class="card-content">${description}</div>` : ""}
      </div>`;
    await ChatMessage.create({ speaker, content });
  }

  /**
   * Cast this spell: check limitation, consume PM or ritual ingredients,
   * decrement uses, post chat message.
   */
  async castSpell() {
    if (this.type !== "spell") return;
    const actor = this.actor;
    if (!actor) return;

    // 1. Check limitation (uses per rest)
    if (this.system.limitation > 0 && this.system.limitationValue <= 0) {
      ui.notifications.warn(`${this.name} : ${game.i18n.localize("ANTIQUE.Spell.NoUsesLeft")}`);
      return;
    }

    let costInfo = "";

    // 2. Non-ritual spell: consume PM
    if (!this.system.ritual) {
      if (this.system.cost > 0) {
        if ((actor.system.pm?.value ?? 0) < this.system.cost) {
          ui.notifications.warn(`${this.name} : ${game.i18n.localize("ANTIQUE.Spell.NotEnoughPM")}`);
          return;
        }
        await actor.update({ "system.pm.value": actor.system.pm.value - this.system.cost });
        costInfo = `<i class="fas fa-fire"></i> ${this.system.cost} ${game.i18n.localize("ANTIQUE.PM")} (${game.i18n.localize("ANTIQUE.Spell.PMConsumed")})`;
      }
    } else {
      // 3. Ritual spell: consume ingredient from inventory
      if (this.system.costText) {
        const searchName = this.system.costText.toLowerCase();
        const ingredient = actor.items.find(i =>
          i.type === "equipment"
          && i.system.consumable
          && i.name.toLowerCase().includes(searchName)
          && i.system.quantity > 0
        );
        if (!ingredient) {
          ui.notifications.warn(`${this.name} : ${game.i18n.format("ANTIQUE.Spell.MissingIngredient", { name: this.system.costText })}`);
          return;
        }
        await ingredient.update({ "system.quantity": ingredient.system.quantity - 1 });
        costInfo = `<i class="fas fa-mortar-pestle"></i> ${game.i18n.localize("ANTIQUE.Spell.IngredientConsumed")} : ${ingredient.name}`;
      }
    }

    // 4. Decrement uses if limited
    if (this.system.limitation > 0) {
      await this.update({ "system.limitationValue": this.system.limitationValue - 1 });
    }

    // 5. Build chat message
    const speaker = ChatMessage.getSpeaker({ actor: actor });
    const castLabel = game.i18n.localize("ANTIQUE.Spell.Cast");
    const parts = [`<b>${speaker.alias ?? actor.name ?? ""}</b> ${castLabel} <b>${this.name}</b>`];

    if (this.system.effect) {
      parts.push(`<em>${this.system.effect}</em>`);
    }

    if (costInfo) {
      parts.push(costInfo);
    }

    // Uses remaining
    if (this.system.limitation > 0) {
      parts.push(`<i class="fas fa-hourglass-half"></i> ${this.system.limitationValue} / ${this.system.limitation} ${game.i18n.localize("ANTIQUE.Spell.UsesRemaining")}`);
    }

    await ChatMessage.create({
      speaker,
      content: `<div class="antique spell-chat-card">${parts.join("<br>")}</div>`
    });
  }

  /**
   * Consume one unit of this item.
   * For equipment: decrements quantity.
   * For weapons with linked ammo: decrements the linked consumable.
   */
  async consume() {
    if (!this.system.consumable) return;

    if (this.type === "equipment") {
      if (this.system.quantity <= 0) {
        ui.notifications.warn(`${this.name} : stock épuisé !`);
        return;
      }
      const newQty = this.system.quantity - 1;
      await this.update({ "system.quantity": newQty });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<p><strong>${this.name}</strong> consommé. Reste : <strong>${newQty}</strong> unité(s).</p>`
      });
    } else if (this.type === "weapon") {
      const linkedAmmo = this.system.linkedAmmoId && this.actor
        ? this.actor.items.get(this.system.linkedAmmoId)
        : null;
      if (!linkedAmmo || linkedAmmo.system.quantity <= 0) {
        ui.notifications.warn(`${this.name} : plus de munitions !`);
        return;
      }
      const newQty = linkedAmmo.system.quantity - 1;
      await linkedAmmo.update({ "system.quantity": newQty });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<p><strong>${this.name}</strong> : munition tirée (${linkedAmmo.name}). Reste : <strong>${newQty}</strong> unité(s).</p>`
      });
    }
  }
}
