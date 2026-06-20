/**
 * Migration des avantages du système Antique pour Foundry VTT v14
 * Ajoute des ActiveEffect automatiques aux items ne les ayant pas
 * Backup réalisé dans _backup_db_20250115/ avant exécution
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

// ============================================
// MAPPING DES EFFETS À APPLIQUER
// ============================================
// Format: { _id: [ { key, mode, value, target? } ] }
// Modes: 0=set, 1=add, 2=multiply, 3=min, 4=max, 5=upTo
const EFFECT_MAPPING = {
  // === Coût -1 (Base) ===
  "aAdv000000000002": [ // Sens aiguisé
    { key: "system.skills.perception.bonus", mode: 2, value: 2 }
  ],
  "aAdv000000000007": [ // Athlète
    { key: "system.attributes.movement.value", mode: 2, value: 2 }
  ],
  "aAdv000000000011": [ // Peau dense
    { key: "system.ca.base", mode: 2, value: 2 }
  ],
  "aAdv000000000012": [ // Mule
    { key: "system.attributes.encumbrance.value", mode: 2, value: 2 }
  ],
  // Ces avantages ont déjà des effets dans le DB, vérification:
  // "aAdv000000000008": [ // Sang froid - déjà OK
  // "aAdv000000000013": [ // Vif - déjà OK
  // "aAdv000000000014": [ // Cuir de Héros - déjà OK
  // "aAdv000000000015": [ // Pisteur - déjà OK
  // "aAdv000000000006": [ // Sens artistique - déjà OK

  // === Coût -1 (Divins) ===
  "aAdv000000000035": [ // Colère de Zeus
    { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }
  ],
  "aAdv000000000047": [ // Protection d'Athéna
    { key: "system.ca.base", mode: 2, value: 2 }
  ],
  "aAdv000000000051": [ // Rage d'Arès
    // Non automatisable (2 attaques/tour) - nécessite un Hook
  ],
  "aAdv000000000055": [ // Cuisine de Déméter
    // Effet: rations régénératives - non automatisable via ActiveEffect seul
  ],

  // === Coût -2 (Base) ===
  "aAdv000000000018": [ // Orientation
    // Non automatisable (mécanique narrative)
  ],
  "aAdv000000000019": [ // Porte-bouclier
    // Non automatisable (mécanique sociale/combat)
  ],
  "aAdv000000000020": [ // Chrono-sens
    // Non automatisable
  ],
  "aAdv000000000021": [ // Don des langues
    // Non automatisable (polyglotte)
  ],
  "aAdv000000000022": [ // Voix enchanteresse
    { key: "system.skills.seduction.bonus", mode: 2, value: 2 },
    { key: "system.skills.baratin.bonus", mode: 2, value: 2 }
  ],
  "aAdv000000000023": [ // Volonté de fer
    { key: "system.saves.volonte.base", mode: 2, value: 2 }
  ],
  "aAdv000000000024": [ // Ami des animaux
    // Non automatisable
  ],
  "aAdv000000000025": [ // Maître d'Arme
    { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2, condition: "weaponProficient" }
    // Note: condition nécessite un script supplémentaire
  ],
  "aAdv000000000026": [ // Maître des forges
    // Non automatisable
  ],
  "aAdv000000000027": [ // Ambidextrie
    // Non automatisable (annule la pénalité de main non dominante)
  ],
  "aAdv000000000028": [ // Faveur +
    // Non automatisable
  ],

  // === Coût -2 (Divins) ===
  "aAdv000000000036": [ // Étincelle de Zeus
    // 1/4 chance de Stun - nécessite un Hook
  ],
  "aAdv000000000040": [ // Vision d'Héra
    // Non automatisable (info narrative)
  ],
  "aAdv000000000044": [ // Force de Poséidon
    { key: "system.ca.base", mode: 2, value: 1 },
    { key: "system.ca.base", mode: 2, value: 2, condition: "nearWater" } // Nécessite un Hook pour détecter la proximité de la mer
  ],
  "aAdv000000000046": [ // Voix d'Athéna
    // Non automatisable (contrôle mental)
  ],
  "aAdv000000000048": [ // Voix d'Athéna (duplicate ID?) - skip
  ],
  "aAdv000000000052": [ // Corps d'Arès
    { key: "system.ca.base", mode: 2, value: 2 }
  ],
  "aAdv000000000056": [ // Moisson de Déméter
    // Non automatisable (trouver nourriture)
  ],
  "aAdv000000000060": [ // Visée d'Apollon
    { key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 2 }
  ],
  "aAdv000000000064": [ // Mire d'Artémis
    { key: "system.attackBonuses.ranged.bonus", mode: 2, value: 3 }
  ],
  "aAdv000000000068": [ // Talent d'Héphaïstos
    { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }
  ],
  "aAdv000000000072": [ // Charme d'Aphrodite
    { key: "system.attributes.attackRoll.bonus", mode: 2, value: -2, target: "enemy" }
    // Note: Réduit le jet de touche de l'adversaire (nécessite ciblage)
  ],
  "aAdv000000000076": [ // Pieds d'Hermès
    { key: "system.attributes.movement.value", mode: 2, value: 4 }
  ],
  "aAdv000000000080": [ // Talent de Dionysos
    // Résistance à la drogue/alcool - pourrait utiliser un flag
  ],
  "aAdv000000000084": [ // Flamme d'Hestia
    // Non automatisable (immunité froid/humide)
  ],
  "aAdv000000000088": [ // Lanterne d'Hécate
    // Non automatisable (vision dans le noir)
  ],

  // === Coût -3 (Base) ===
  "aAdv000000000029": [ // Taille imposante
    { key: "system.pv.max", mode: 2, value: 10 },
    { key: "system.attributes.size", mode: 0, value: "large" } // Si le système gère la taille
  ],
  "aAdv000000000030": [ // Dieu de l'esquive
    // Non automatisable (esquive illimitée)
  ],
  "aAdv000000000031": [ // Dieu du stade
    // Non automatisable (pas de fatigue)
  ],
  "aAdv000000000032": [ // Dieu de la guerre
    // Non automatisable (pas de malus 2ème attaque)
  ],
  "aAdv000000000033": [ // Rageux
    // Non automatisable (dégâts accrus en rage)
  ],
  "aAdv000000000034": [ // Faveur ++
    // Non automatisable
  ],

  // === Coût -3 (Divins - Auras) ===
  // Note: Les auras affectent l'équipe, pas seulement le porteur.
  // Foundry v14 supporte target: "allies" dans ActiveEffect pour les effets de combat,
  // mais pas pour les effets passifs. Nécessite un module comme DFreds Convenient Effects.
  "aAdv000000000037": [ // Aura de Zeus
    { key: "system.attributes.force.base", mode: 2, value: 2 }
    // ⚠️ sera appliqué seulement au porteur, pas à l'équipe
  ],
  "aAdv000000000041": [ // Aura d'Héra
    { key: "system.attributes.astuce.base", mode: 2, value: 2 }
  ],
  "aAdv000000000045": [ // Aura de Poséidon
    { key: "system.attributes.constitution.base", mode: 2, value: 2 }
  ],
  "aAdv000000000049": [ // Aura d'Athéna
    { key: "system.attributes.intelligence.base", mode: 2, value: 2 }
    // Note: corrigé de "Force" à "Intelligence" (bug du compendium original)
  ],
  "aAdv000000000053": [ // Aura d'Arès
    { key: "system.attributes.force.base", mode: 2, value: 2 }
  ],
  "aAdv000000000057": [ // Aura de Déméter
    { key: "system.attributes.constitution.base", mode: 2, value: 2 }
  ],
  "aAdv000000000061": [ // Aura d'Apollon
    { key: "system.attributes.astuce.base", mode: 2, value: 2 }
  ],
  "aAdv000000000065": [ // Aura d'Artémis
    { key: "system.attributes.dexterite.base", mode: 2, value: 2 }
  ],
  "aAdv000000000069": [ // Aura d'Héphaïstos
    { key: "system.attributes.force.base", mode: 2, value: 2 }
  ],
  "aAdv000000000073": [ // Aura d'Aphrodite
    { key: "system.attributes.charisme.base", mode: 2, value: 2 }
  ],
  "aAdv000000000077": [ // Aura d'Hermès
    { key: "system.attributes.dexterite.base", mode: 2, value: 2 }
  ],
  "aAdv000000000081": [ // Aura de Dionysos
    { key: "system.attributes.charisme.base", mode: 2, value: 2 }
  ],
  "aAdv000000000085": [ // Aura d'Hestia
    { key: "system.attributes.constitution.base", mode: 2, value: 2 }
    // Note: corrigé de "Charisme" à "Constitution" (bug du compendium original)
  ],
  "aAdv000000000089": [ // Aura d'Hécate
    { key: "system.attributes.astuce.base", mode: 2, value: 2 }
  ],
  "aAdv000000000093": [ // Aura d'Hadès
    { key: "system.attributes.constitution.base", mode: 2, value: 2 }
  ],

  // === Coût -5 (Légendaires) ===
  "aAdv000000000038": [ // Sang de Zeus
    { key: "system.pv.max", mode: 2, value: 1 } // "Extra Life" - à ajuster selon la mécanique souhaitée
    // Note: Peut nécessiter un effet personnalisé pour "vie supplémentaire"
  ],
  "aAdv000000000042": [ // Faveur de la Dame
    // 3 relances de jet - nécessite un Hook personnalisé
  ],
  "aAdv000000000046": [ // Paume de Poséidon
    // Bateau Magique - non automatisable (item/équipement spécial)
  ],
  "aAdv000000000050": [ // Esprit d'Athéna
    // Avertissement divin - non automatisable (narratif)
  ],
  "aAdv000000000054": [ // Armure d'Arès
    // Frénésie après 2 kills - nécessite un Hook de combat
  ],
  "aAdv000000000058": [ // Blé de Déméter
    { key: "system.pv.regeneration", mode: 2, value: 3 }
    // Si le système Antique a une propriété regeneration
  ],
  "aAdv000000000062": [ // Œil d'Apollon
    // Oracle - non automatisable
  ],
  "aAdv000000000066": [ // Compagnon d'Artémis
    // Animal magique - nécessite création d'un acteur allié
  ],
  "aAdv000000000070": [ // Yeux d'Héphaïstos
    // Détecter magie - nécessite un Hook ou macro
  ],
  "aAdv000000000074": [ // Murmure d'Aphrodite
    // Secrets - non automatisable
  ],
  "aAdv000000000078": [ // Message d'Hermès
    // Communication - non automatisable
  ],
  "aAdv000000000082": [ // Amphore de Dionysos
    { key: "system.pv.value", mode: 0, value: "system.pv.max" }
    // Soin complet 1/jour - à implémenter via une macro/hook
  ],
  "aAdv000000000086": [ // Bûcher d'Hestia
    // Feu protecteur - non automatisable (création d'objet scène)
  ],
  "aAdv000000000090": [ // Lune d'Hécate
    // Rituel supplémentaire - nécessite gestion des rituels
  ],
  "aAdv000000000094": [ // Peau d'Hadès
    { key: "system.pv.max", mode: 2, value: 2 }
    // Multiplie les PV par 2
  ]
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function createActiveEffect(name, img, changes) {
  return {
    _id: `effect-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: name,
    img: img || "icons/svg/aura.svg",
    changes: changes.map(c => ({
      key: c.key,
      mode: c.mode !== undefined ? c.mode : 2, // Default: multiply
      value: c.value,
      ...(c.target && { target: c.target }),
      ...(c.condition && { condition: c.condition })
    })),
    disabled: false,
    transfer: true,
    duration: { seconds: null, startTime: null },
    flags: {}
  };
}

// cle les caractères accentués pour le nom des effets
function cleanName(name) {
  return name
    .replace(/[()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// FONCTION PRINCIPALE DE MIGRATION
// ============================================
async function migrateCompendium() {
  const compendiumPath = path.join(__dirname, 'avantages');
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('🔄 [Migration] Début de la migration des avantages...\n');

  let updatedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) {
      skippedCount++;
      continue; // Ignorer les dossiers
    }

    try {
      const item = JSON.parse(value);
      
      // Vérifier que c'est bien un avantage
      if (!item.name || item.type !== 'advantage') {
        skippedCount++;
        continue;
      }

      // Créer un backup de l'item original dans un objet
      const original = JSON.parse(JSON.stringify(item));

      // Initialiser effects si absent
      if (!item.effects) {
        item.effects = [];
      }

      // Vérifier si des effets existent déjà
      const hasExistingEffects = item.effects && item.effects.length > 0;

      // Appliquer les effets mappés
      if (EFFECT_MAPPING[item._id]) {
        const changesList = EFFECT_MAPPING[item._id];
        
        // Ne pas écraser les effets existants
        if (hasExistingEffects) {
          console.log(`⚠️  [${item.name}] a déjà des effets. Ajout des nouveaux effets.`);
        }

        changesList.forEach(effectConfig => {
          // Créer un nom pour l'effet
          const effectName = `Effet: ${cleanName(item.name).substring(0, 30)}`;
          const effect = createActiveEffect(effectName, item.img, effectConfig);
          item.effects.push(effect);
        });

        // Sauvegarder les modifications
        await db.put(key, JSON.stringify(item));
        updatedCount++;
        console.log(`✅ [${item.name}] - ${changesList.length} effet(s) ajouté(s)`);
      } else {
        skippedCount++;
        if (item.effects && item.effects.length > 0) {
          console.log(`ℹ️  [${item.name}] - Effets déjà présents (${item.effects.length})`);
        } else {
          console.log(`ℹ️  [${item.name}] - Aucun effet à ajouter (mécanique non automatisable)`);
        }
      }
    } catch (e) {
      errorCount++;
      console.error(`❌ [ERREUR] ${key}: ${e.message}`);
    }
  }

  await db.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 [Résumé de la migration]');
  console.log('='.repeat(60));
  console.log(`✅ Avantages modifiés : ${updatedCount}`);
  console.log(`ℹ️  Avantages sans modification : ${skippedCount}`);
  console.log(`❌ Erreurs : ${errorCount}`);
  console.log('\n⚠️  DES EFFETS NON AUTOMATISABLES RESTERONT À GÉRER MANUELLEMENT.');
  console.log('    Utilisez un module comme "DFreds Convenient Effects" ou des Hooks.');
}

// ============================================
// EXÉCUTION
// ============================================
console.log('📋 [Antique v14] Migration des ActiveEffects pour les avantages\n');
console.log('🔹 Backup disponible dans : _backup_db_20250115/\n');

migrateCompendium().catch(err => {
  console.error('❌ Erreur critique:', err);
  process.exit(1);
});

