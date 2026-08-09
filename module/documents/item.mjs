import { buildAttackFlavor } from "../helpers/rolls.mjs";
import { refreshSheet } from "../helpers/sheet-utils.mjs";

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

    // Guard against a stray double-invocation (e.g. a click handler rebound twice
    // across sheet re-renders) firing this before the first roll has resolved.
    if (this._rollingAttack) return;
    this._rollingAttack = true;
    try {
      return await this._doRollAttack();
    } finally {
      this._rollingAttack = false;
    }
  }

  async _doRollAttack() {
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
        refreshSheet(this.actor);
        refreshSheet(linkedAmmo);
        refreshSheet(this);
      }
    }

    // Ranged weapons can also be used in melee — ask which attack bonus applies.
    // Melee-only weapons skip straight to the roll, unchanged.
    if (this.system.hasPortee) {
      return new Promise(resolve => {
        foundry.applications.api.DialogV2.wait({
          window: { title: game.i18n.format("ANTIQUE.Weapon.ChooseAttackType", { name: this.name }) },
          content: `<p>${game.i18n.localize("ANTIQUE.Weapon.ChooseAttackTypeHint")}</p>`,
          buttons: [
            {
              action: "distance",
              icon: "fas fa-bullseye",
              label: game.i18n.localize("ANTIQUE.Weapon.AttackDistance"),
              default: true,
              callback: () => resolve(this._executeAttackRoll("distance"))
            },
            {
              action: "melee",
              icon: "fas fa-khanda",
              label: game.i18n.localize("ANTIQUE.Weapon.AttackMelee"),
              callback: () => resolve(this._executeAttackRoll("melee"))
            }
          ],
          rejectClose: false
        }).then(result => { if (result === null) resolve(null); });
      });
    }

    return this._executeAttackRoll("melee");
  }

  /**
   * Perform the actual 1d20 + bonus attack roll and post it to chat.
   * @param {"melee"|"distance"} mode
   */
  async _executeAttackRoll(mode) {
    const itemBonus = mode === "distance" ? this.system.attBonusDistance : this.system.attBonus;
    const category = mode === "distance" ? this.system.categoryDistance : this.system.category;
    const catTotal = this.actor?.system.attackBonuses?.[category]?.total ?? 0;
    const attBonus = itemBonus + catTotal;
    const roll = new Roll("1d20 + @attBonus", { attBonus });
    await roll.evaluate();
    const modeLabel = game.i18n.localize(mode === "distance" ? "ANTIQUE.Weapon.AttackDistance" : "ANTIQUE.Weapon.AttackMelee");
    const flavor = buildAttackFlavor(`${this.name} (${modeLabel}) - Jet d'attaque`, roll.total);
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
    const damageBonus = this.actor?.system.attackBonuses?.[this.system.category]?.damageBonus ?? 0;
    const formula = damageBonus ? `${this.system.damage} + @damageBonus` : this.system.damage;
    const roll = new Roll(formula, { damageBonus });
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

    // 1.5. Ingredient checklist (system.ingredients, the "Ingrédients" tab) only
    // restricts player characters — a PNJ's spells are cast freely by the GM
    // regardless of what's ticked there, so this whole block is skipped for
    // anything other than actor.type === "character".
    let consumeIngredients = false;
    if (actor.type === "character" && this.system.ingredients.length) {
      const missing = this.system.ingredients.filter(i => !i.possede);
      if (missing.length) {
        const names = missing.map(i => i.name || "?").join(", ");
        ui.notifications.warn(`${this.name} : ${game.i18n.format("ANTIQUE.Spell.MissingIngredients", { names })}`);
        return;
      }

      const choice = await foundry.applications.api.DialogV2.wait({
        window: { title: game.i18n.format("ANTIQUE.Spell.ConsumeIngredientsTitle", { name: this.name }) },
        content: `<p>${game.i18n.localize("ANTIQUE.Spell.ConsumeIngredientsHint")}</p>`,
        buttons: [
          {
            action: "consume",
            icon: "fas fa-mortar-pestle",
            label: game.i18n.localize("ANTIQUE.Spell.ConsumeIngredients"),
            default: true,
            callback: () => true
          },
          {
            action: "keep",
            icon: "fas fa-recycle",
            label: game.i18n.localize("ANTIQUE.Spell.KeepIngredients"),
            callback: () => false
          }
        ],
        rejectClose: false
      });
      // Closed without choosing (window X) — abort the cast rather than guess.
      if (choice === null) return;
      consumeIngredients = choice;
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
        refreshSheet(actor);
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
        refreshSheet(actor);
        refreshSheet(ingredient);
        costInfo = `<i class="fas fa-mortar-pestle"></i> ${game.i18n.localize("ANTIQUE.Spell.IngredientConsumed")} : ${ingredient.name}`;
      }
    }

    // 4. Decrement uses if limited
    if (this.system.limitation > 0) {
      await this.update({ "system.limitationValue": this.system.limitationValue - 1 });
      refreshSheet(actor);
      refreshSheet(this);
    }

    // 4.5. Un-tick every ingredient if the player chose to spend them — they'll
    // need to re-tick "possédé" (after resupplying) before casting again.
    if (consumeIngredients) {
      const ingredients = this.system.ingredients.map(i => ({ ...i, possede: false }));
      await this.update({ "system.ingredients": ingredients });
      refreshSheet(actor);
      refreshSheet(this);
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

    if (actor.type === "character" && this.system.ingredients.length) {
      parts.push(consumeIngredients
        ? `<i class="fas fa-mortar-pestle"></i> ${game.i18n.localize("ANTIQUE.Spell.IngredientsConsumed")}`
        : `<i class="fas fa-recycle"></i> ${game.i18n.localize("ANTIQUE.Spell.IngredientsKept")}`);
    }

    // Uses remaining
    if (this.system.limitation > 0) {
      parts.push(`<i class="fas fa-hourglass-half"></i> ${this.system.limitationValue} / ${this.system.limitation} ${game.i18n.localize("ANTIQUE.Spell.UsesRemaining")}`);
    }

    // 6. Buff spells (ex. Peau d'écorce) offer a button to apply their CA bonus —
    // same pattern as the "apply-damage" button on rollDamage()'s chat card.
    let applyEffectButton = "";
    if (this.system.caBonus) {
      const applyLabel = game.i18n.format("ANTIQUE.Effect.ApplyButton", { amount: this.system.caBonus });
      applyEffectButton = `
        <button type="button" class="apply-effect" data-ca-bonus="${this.system.caBonus}" data-spell-name="${this.name}">
          <i class="fas fa-shield-halved"></i> ${applyLabel}
        </button>`;
    }

    // 7. Area spells (ex. Brouillard) offer a button to drag a circular template
    // onto the scene, sized/textured per the spell's own configuration.
    let placeTemplateButton = "";
    if (this.system.hasTemplate) {
      const placeLabel = game.i18n.localize("ANTIQUE.Spell.PlaceTemplate");
      placeTemplateButton = `
        <button type="button" class="place-template" data-radius="${this.system.templateRadius}" data-texture="${this.system.templateTexture}" data-color="${this.system.templateColor}" data-spell-name="${this.name}">
          <i class="fas fa-circle-notch"></i> ${placeLabel}
        </button>`;
    }

    await ChatMessage.create({
      speaker,
      content: `<div class="antique spell-chat-card">${parts.join("<br>")}${applyEffectButton}${placeTemplateButton}</div>`
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
      refreshSheet(this.actor);
      refreshSheet(this);
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
      refreshSheet(this.actor);
      refreshSheet(linkedAmmo);
      refreshSheet(this);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<p><strong>${this.name}</strong> : munition tirée (${linkedAmmo.name}). Reste : <strong>${newQty}</strong> unité(s).</p>`
      });
    }
  }
}
