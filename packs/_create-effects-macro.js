/**
 * Macro Foundry VTT — Création des items Effet
 * Extraits des avantages/désavantages ayant des modificateurs numériques (+/-).
 * À exécuter dans Foundry en tant que macro Script (type: script).
 */

// Mapping ability → skill keys for Aura effects
const ABILITY_SKILLS = {
  for: ["combatMainNue","armeBlanche","armeDeJet","levage","parade","armeExotique","combatDeuxMains","artisanatFor"],
  dex: ["esquive","armeADistance","escamotage","acrobatie","discretion","dressage","jeux","artisanatDex"],
  con: ["resistancePoisons","resistanceDouleur","athletisme","equitation","natation","vigueur","survie"],
  ast: ["premierSoin","investigation","mysticisme","navigation","linguistique","vigilance","empathie","perception"],
  cha: ["intimidation","dissimulation","commandement","seduction","baratin","psychologie","marchandage","representation"]
};

function auraChanges(ability, bonus) {
  return ABILITY_SKILLS[ability].map(sk => ({
    key: `system.skills.${sk}.bonus`, mode: 2, value: String(bonus)
  }));
}

const ADD = 2; // CONST.ACTIVE_EFFECT_MODES.ADD

const effects = [
  // ============================================================
  //  AVANTAGES avec modificateurs
  // ============================================================
  {
    name: "Sens aiguisé",
    description: "<p>Choisir un sens qui sera aiguisé (<b>+2</b> bonus perception sens).</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.skills.perception.bonus", mode: ADD, value: "2" }]
  },
  {
    name: "Sens artistique",
    description: "<p>Vous maîtrisez un art ce qui vous donne <b>+2</b> en représentation/art.</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.skills.representation.bonus", mode: ADD, value: "2" }]
  },
  {
    name: "Sang froid",
    description: "<p>Vous résistez à la peur : <b>+2</b> en Volonté.</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.saves.volonte.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Peau dense",
    description: "<p>Augmente la <b>CA de base de +2</b>.</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.ca.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Vif",
    description: "<p>Réflexe base <b>+2</b>.</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.saves.reflexes.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Cuir de Héro",
    description: "<p>Robustesse base <b>+2</b>.</p>",
    source: "Avantage (coût 1)",
    changes: [{ key: "system.saves.robustesse.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Pisteur",
    description: "<p>La chasse n'a pas de secret pour vous : <b>+2</b> vigueur et nature (dans la nature).</p>",
    source: "Avantage (coût 1)",
    changes: [
      { key: "system.skills.vigueur.bonus", mode: ADD, value: "2" },
      { key: "system.skills.nature.bonus", mode: ADD, value: "2" }
    ]
  },
  {
    name: "Taille imposante",
    description: "<p>Mesure dans les 2m, points de vie augmentés de <b>+10</b>.</p>",
    source: "Avantage (coût 3)",
    changes: [{ key: "system.pv.max", mode: ADD, value: "10" }]
  },
  {
    name: "Voix enchanteresse",
    description: "<p>Auriez-vous du sang de sirène, car votre voix est hypnotique : <b>+2</b> à certaines compétences de Charisme.</p>",
    source: "Avantage (coût 2)",
    gmNotes: "<p>Le MJ choisit quelles compétences de Charisme bénéficient du +2 selon la situation.</p>",
    changes: []
  },
  {
    name: "Maître d'Arme",
    description: "<p>Vous êtes un maître du maniement d'une arme : <b>+2</b> au toucher avec l'arme choisie.</p>",
    source: "Avantage (coût 2)",
    gmNotes: "<p>Le joueur choisit une arme spécifique. Appliquer +2 au bonus d'attaque de la catégorie correspondante.</p>",
    changes: []
  },

  // ============================================================
  //  BÉNÉDICTIONS avec modificateurs directs
  // ============================================================
  {
    name: "Colère de Zeus",
    description: "<p>Dégâts au corps à corps <b>+3</b>.</p>",
    source: "Bénédiction de Zeus",
    gmNotes: "<p>Ajouter +3 aux jets de dégâts au corps à corps.</p>",
    changes: []
  },
  {
    name: "Visée d'Apollon",
    description: "<p>Permet d'ajouter un bonus de <b>+2</b> aux armes à distance.</p>",
    source: "Bénédiction d'Apollon",
    changes: [{ key: "system.attackBonuses.armeADistance.bonus", mode: ADD, value: "2" }]
  },
  {
    name: "Mire d'Artèmis",
    description: "<p>Dégâts à distance <b>+3</b>.</p>",
    source: "Bénédiction d'Artèmis",
    gmNotes: "<p>Ajouter +3 aux jets de dégâts à distance.</p>",
    changes: []
  },
  {
    name: "Talent d'Héphaistos",
    description: "<p>Augmente les dégâts de corps à corps <b>+3</b>.</p>",
    source: "Bénédiction d'Héphaistos",
    gmNotes: "<p>Ajouter +3 aux jets de dégâts au corps à corps.</p>",
    changes: []
  },
  {
    name: "Protection d'Athéna",
    description: "<p>Augmente la CA de <b>+2</b>.</p>",
    source: "Bénédiction d'Athéna",
    changes: [{ key: "system.ca.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Corps d'Arès",
    description: "<p>Renforce la CA de <b>+2</b>.</p>",
    source: "Bénédiction d'Arès",
    changes: [{ key: "system.ca.temp", mode: ADD, value: "2" }]
  },
  {
    name: "Force de Poséidon",
    description: "<p>Augmente la CA de <b>+1</b> de l'équipe (<b>+2</b> si proche de la mer).</p>",
    source: "Bénédiction de Poséidon",
    gmNotes: "<p>+1 CA de base, passer à +2 si l'équipe est proche de la mer.</p>",
    changes: [{ key: "system.ca.temp", mode: ADD, value: "1" }]
  },

  // ============================================================
  //  AURAS (équipe : +2 aux jets d'une caractéristique)
  // ============================================================
  {
    name: "Aura de Zeus",
    description: "<p>Renforce les jets de <b>Force</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction de Zeus",
    changes: auraChanges("for", 2)
  },
  {
    name: "Aura d'Athéna",
    description: "<p>Renforce les jets de <b>Force</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Athéna",
    changes: auraChanges("for", 2)
  },
  {
    name: "Aura d'Arès",
    description: "<p>Renforce les jets de <b>Force</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Arès",
    changes: auraChanges("for", 2)
  },
  {
    name: "Aura d'Héphaïstos",
    description: "<p>Renforce les jets de <b>Force</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Héphaïstos",
    changes: auraChanges("for", 2)
  },
  {
    name: "Aura d'Artèmis",
    description: "<p>Renforce les jets de <b>Dextérité</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Artèmis",
    changes: auraChanges("dex", 2)
  },
  {
    name: "Aura d'Hermès",
    description: "<p>Renforce les jets de <b>Dextérité</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Hermès",
    changes: auraChanges("dex", 2)
  },
  {
    name: "Aura de Poséidon",
    description: "<p>Renforce les jets de <b>Constitution</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction de Poséidon",
    changes: auraChanges("con", 2)
  },
  {
    name: "Aura de Déméter",
    description: "<p>Renforce les jets de <b>Constitution</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction de Déméter",
    changes: auraChanges("con", 2)
  },
  {
    name: "Aura d'Hadès",
    description: "<p>Renforce les jets de <b>Constitution</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Hadès",
    changes: auraChanges("con", 2)
  },
  {
    name: "Aura d'Héra",
    description: "<p>Renforce les jets d'<b>Astuce</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Héra",
    changes: auraChanges("ast", 2)
  },
  {
    name: "Aura d'Apollon",
    description: "<p>Renforce les jets d'<b>Astuce</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Apollon",
    changes: auraChanges("ast", 2)
  },
  {
    name: "Aura d'Hécate",
    description: "<p>Renforce les jets d'<b>Astuce</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Hécate",
    changes: auraChanges("ast", 2)
  },
  {
    name: "Aura d'Aphrodite",
    description: "<p>Renforce les jets de <b>Charisme</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Aphrodite",
    changes: auraChanges("cha", 2)
  },
  {
    name: "Aura de Dionysos",
    description: "<p>Renforce les jets de <b>Charisme</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction de Dionysos",
    changes: auraChanges("cha", 2)
  },
  {
    name: "Aura d'Hestia",
    description: "<p>Renforce les jets de <b>Charisme</b> de l'équipe avec <b>+2</b>.</p>",
    source: "Bénédiction d'Hestia",
    changes: auraChanges("cha", 2)
  },

  // ============================================================
  //  DÉSAVANTAGES avec modificateurs
  // ============================================================
  {
    name: "Sens défaillant",
    description: "<p>Choisir un sens qui sera défaillant : <b>-2</b> bonus perception sens.</p>",
    source: "Désavantage (coût 1)",
    changes: [{ key: "system.skills.perception.bonus", mode: ADD, value: "-2" }]
  },
  {
    name: "Frêle",
    description: "<p>Robustesse de base <b>-1</b>.</p>",
    source: "Désavantage (coût 1)",
    changes: [{ key: "system.saves.robustesse.temp", mode: ADD, value: "-1" }]
  },
  {
    name: "Enfant",
    description: "<p>On ne vous prend pas au sérieux au vu de votre jeune âge : <b>-2</b> dans certaines compétences de Charisme.</p>",
    source: "Désavantage (coût 1)",
    gmNotes: "<p>Le MJ décide quelles compétences de Charisme subissent le -2 selon la situation.</p>",
    changes: []
  },
  {
    name: "Distrait",
    description: "<p>Vous avez un désavantage en vigilance : <b>-2</b>.</p>",
    source: "Désavantage (coût 1)",
    changes: [{ key: "system.skills.vigilance.bonus", mode: ADD, value: "-2" }]
  },
  {
    name: "Dépressif",
    description: "<p>Volonté de base <b>-1</b>.</p>",
    source: "Désavantage (coût 1)",
    changes: [{ key: "system.saves.volonte.temp", mode: ADD, value: "-1" }]
  },
  {
    name: "Maladroit",
    description: "<p>Réflexe de base <b>-1</b>.</p>",
    source: "Désavantage (coût 1)",
    changes: [{ key: "system.saves.reflexes.temp", mode: ADD, value: "-1" }]
  },
  {
    name: "Introverti",
    description: "<p>Lorsqu'il y a plus de 3 inconnus votre voix se perd : <b>-2</b> compétences de Charisme.</p>",
    source: "Désavantage (coût 1)",
    gmNotes: "<p>Appliquer -2 aux compétences de Charisme en présence de 3+ inconnus.</p>",
    changes: auraChanges("cha", -2)
  },
  {
    name: "Poigne d'Arès",
    description: "<p>Vos membres s'endolorissent après chaque action : <b>+1 difficulté</b> pour deuxième attaque.</p>",
    source: "Désavantage d'Arès",
    gmNotes: "<p>Augmenter la difficulté de 1 pour toute deuxième attaque dans le même tour.</p>",
    changes: []
  }
];

// === EXECUTION ===
(async () => {
  // 1. Create folder "Effet"
  const folder = await Folder.create({
    name: "Effet",
    type: "Item",
    color: "#7c4a1e"
  });
  console.log(`Antique | Dossier "Effet" créé (${folder.id})`);

  let created = 0;
  for (const eff of effects) {
    // 2. Create the effect item
    const item = await Item.create({
      name: eff.name,
      type: "effect",
      folder: folder.id,
      img: "icons/svg/aura.svg",
      system: {
        description: eff.description + (eff.source ? `<p><em>Source : ${eff.source}</em></p>` : ""),
        gmNotes: eff.gmNotes || "",
        active: false,
        duration: ""
      }
    });

    // 3. Create embedded ActiveEffect with changes
    if (eff.changes && eff.changes.length > 0) {
      await item.createEmbeddedDocuments("ActiveEffect", [{
        name: eff.name,
        icon: "icons/svg/aura.svg",
        changes: eff.changes,
        disabled: false
      }]);
    }

    created++;
    console.log(`Antique | Effet créé : ${eff.name} (${eff.changes?.length || 0} modificateurs)`);
  }

  ui.notifications.info(`${created} effets créés dans le dossier "Effet" !`);
})();
