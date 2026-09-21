/**
 * Registre des correctifs de contenu de compendium en attente de propagation vers un
 * monde déjà déployé — remplace, pour les futures sessions, l'écriture d'un script
 * `packs/_fix-*-live.js` à coller dans une macro GM. Chaque entrée est proposée au GM
 * via un écran à cocher (module/apps/pack-update-picker.mjs), par compendium, et ne
 * touche le monde que si elle est cochée : jamais d'écrasement en bloc d'un document
 * existant, uniquement des créations de documents manquants et des corrections de champs
 * ciblées — même patron que les anciens scripts (game.packs.get, getIndex/getDocument,
 * createDocuments/createEmbeddedDocuments, verrouillage/déverrouillage du pack).
 *
 * `pack` doit correspondre à un `name` de `system.json` → `packs[]`, à une exception près :
 * la valeur pseudo-pack "acteurs" regroupe les correctifs dont `apply()` itère directement
 * sur `game.actors` (le monde, pas un compendium) — module/apps/pack-update-picker.mjs lui
 * donne un libellé dédié puisqu'aucun pack réel ne porte ce nom. Les anciens scripts déjà
 * exécutés et confirmés ne sont pas rétro-portés ici — seuls les correctifs écrits à partir
 * de ce mécanisme y figurent.
 */
export const PACK_UPDATES = [
  {
    id: "0.6.55-embed-effets-simple",
    pack: "avantages",
    version: "0.6.55",
    label: "Effets simples embarqués sur les avantages",
    description:
      "Ajoute l'effet manquant dans l'onglet \"Effets\" des 24 avantages \"effet simple\" " +
      "(Guerrier Aguerri, Equilibre félin, Bon sens, etc.) — jusqu'ici seul un lien dans la " +
      "description existait, l'effet n'était pas réellement attaché à l'avantage.",
    apply: applyEmbedEffetsSimple
  },
  {
    id: "0.6.57-create-effets-batch2",
    pack: "effets",
    version: "0.6.57",
    label: "32 nouveaux effets narratifs (2e vague)",
    description:
      "Crée les 32 documents Effet manquants (Orientation, Etincelle de Zeus, les Auras, " +
      "Faveur de la Dame et le reste de la 2e vague d'avantages -2/-3/-5) — à appliquer " +
      "avant ou avec le correctif \"Avantages\" ci-dessous.",
    apply: applyCreateEffetsBatch2
  },
  {
    id: "0.6.57-embed-effets-batch2",
    pack: "avantages",
    version: "0.6.57",
    label: "32 nouveaux effets simples liés + embarqués sur les avantages",
    description:
      "Ajoute le lien vers l'effet et l'effet embarqué (onglet \"Effets\") sur les 32 " +
      "avantages -2/-3/-5 de la 2e vague.",
    apply: applyEmbedEffetsBatch2
  },
  {
    id: "0.6.58-create-effets-batch3",
    pack: "effets",
    version: "0.6.58",
    label: "18 nouveaux effets mécaniques (étape 2/3)",
    description:
      "Crée les 18 documents Effet manquants : les 15 Auras (bonus de caractéristique) + " +
      "Mire d'Artèmis, Talent d'Héphaistos, Pieds d'Hermes.",
    apply: applyCreateEffetsBatch3
  },
  {
    id: "0.6.58-link-embed-effets-batch3",
    pack: "avantages",
    version: "0.6.58",
    label: "18 effets mécaniques liés (+ 3 embarqués) sur les avantages",
    description:
      "Ajoute le lien vers l'effet sur les 18 avantages concernés, et embarque l'effet " +
      "directement pour Mire d'Artèmis, Talent d'Héphaistos et Pieds d'Hermes (bonus sur " +
      "le porteur lui-même) — pour les 15 Auras, voir le correctif de suivi ci-dessous.",
    apply: applyLinkEmbedEffetsBatch3
  },
  {
    id: "0.6.59-embed-auras",
    pack: "avantages",
    version: "0.6.59",
    label: "Les 15 Auras s'appliquent maintenant aussi au porteur",
    description:
      "Décision revue : les 15 avantages \"Aura d'X\" ne sont plus seulement à glisser sur " +
      "un allié, ils doivent aussi s'appliquer automatiquement au PJ qui possède l'avantage " +
      "— ajoute l'effet embarqué manquant dans leur onglet \"Effets\" (le lien de " +
      "description reste inchangé).",
    apply: applyEmbedAuras
  },
  {
    id: "0.6.60-faveur-de-la-dame-limitation",
    pack: "avantages",
    version: "0.6.60",
    label: "Faveur de la Dame — compteur d'utilisations (3)",
    description:
      "Configure le nouveau compteur d'utilisations limitées (3, rechargeable via le " +
      "bouton \"Réinitialiser\" sur la fiche du personnage) sur l'avantage Faveur de la " +
      "Dame — pas un ActiveEffect, une simple correction de champ.",
    apply: applySetFaveurDeLaDameLimitation
  },
  {
    id: "0.6.61-fix-athlete-effect",
    pack: "avantages",
    version: "0.6.61",
    label: "Athlète — effet manquant ou en double",
    description:
      "Athlète (l'un des 3 tout premiers exemples, construit avant tous les mécanismes de " +
      "propagation ultérieurs) n'a jamais eu de correctif dédié pour les copies déjà " +
      "possédées par un personnage — si un joueur a récupéré Athlète avant l'ajout de son " +
      "effet, sa copie n'en a jamais reçu. Corrige l'absence d'effet ET les doublons " +
      "éventuels (garde une seule copie correcte : Déplacement ×2), sur le compendium et " +
      "les copies déjà possédées.",
    apply: applyFixAthleteEffect
  },
  {
    id: "0.6.63-cleanup-effect-field-avantages",
    pack: "avantages",
    version: "0.6.63",
    label: "Nettoyage : champ \"Effet\" retiré, dédoublonnage",
    description:
      "Le champ texte \"Effet\" (redondant avec la description) est retiré du schéma — son " +
      "contenu est repris dans la description de l'effet actif existant à la place. " +
      "Corrige au passage tout avantage qui se serait retrouvé avec plusieurs effets " +
      "embarqués (probablement causé par le bug .effects.length de la 0.6.62), sur le " +
      "compendium et toutes les copies déjà possédées.",
    apply: applyCleanupEffectFieldAvantages
  },
  {
    id: "0.6.63-cleanup-effect-field-desavantages",
    pack: "desavantages",
    version: "0.6.63",
    label: "Nettoyage : champ \"Effet\" retiré, dédoublonnage",
    description:
      "Même correctif que pour les Avantages, côté Désavantages : retire le champ " +
      "\"Effet\", reprend son contenu dans la description de l'effet actif existant (5 " +
      "désavantages seulement en ont un), et dédoublonne si besoin.",
    apply: applyCleanupEffectFieldDesavantages
  },
  {
    id: "0.6.64-backfill-effect-descriptions-avantages",
    pack: "avantages",
    version: "0.6.64",
    label: "Descriptions des effets actifs — vraiment cette fois",
    description:
      "Les correctifs \"Nettoyage : champ Effet\" (0.6.63) ne recopiaient rien : ils " +
      "lisaient system.effect en direct sur le monde, mais ce champ n'est plus lisible " +
      "une fois retiré du schéma. Ce correctif recopie les bons textes (codés en dur, " +
      "extraits d'avantages.db) dans la description de chaque effet actif existant.",
    apply: applyCleanupEffectFieldAvantages
  },
  {
    id: "0.6.64-backfill-effect-descriptions-desavantages",
    pack: "desavantages",
    version: "0.6.64",
    label: "Descriptions des effets actifs — vraiment cette fois",
    description:
      "Même correctif que pour les Avantages, côté Désavantages (5 désavantages ont un " +
      "effet actif).",
    apply: applyCleanupEffectFieldDesavantages
  },
  {
    id: "0.6.65-create-effet-mule",
    pack: "effets",
    version: "0.6.65",
    label: "Effet de Mule",
    description: "Crée le document Effet manquant (×2 sur la capacité de port).",
    apply: applyCreateEffetMule
  },
  {
    id: "0.6.65-embed-effet-mule",
    pack: "avantages",
    version: "0.6.65",
    label: "Effet de Mule lié + embarqué",
    description:
      "Ajoute le lien et l'effet embarqué (×2 sur la capacité de port) sur l'avantage Mule.",
    apply: applyEmbedEffetMule
  },
  {
    id: "0.6.65-item-weights-armes",
    pack: "armes",
    version: "0.6.65",
    label: "Poids des armes/armures (estimation)",
    description:
      "Ajoute une estimation de poids (kg) aux armes et armures déjà déployées, pour la " +
      "nouvelle capacité de port — approximatif, à corriger au cas par cas.",
    apply: applyItemWeightsArmes
  },
  {
    id: "0.6.65-item-weights-equipement",
    pack: "equipement",
    version: "0.6.65",
    label: "Poids de l'équipement (estimation)",
    description:
      "Même correctif que pour les Armes, côté compendium Équipement.",
    apply: applyItemWeightsEquipement
  },
  {
    id: "0.6.67-create-effets-desavantages",
    pack: "effets",
    version: "0.6.67",
    label: "90 nouveaux effets pour les désavantages",
    description:
      "Crée les 90 documents Effet manquants pour les désavantages (Phobie, les Dévotion, " +
      "etc.) — à appliquer avant ou avec le correctif \"Désavantages\" ci-dessous.",
    apply: applyCreateEffetsDesavantages
  },
  {
    id: "0.6.67-embed-effets-desavantages",
    pack: "desavantages",
    version: "0.6.67",
    label: "90 effets liés + embarqués sur les désavantages",
    description:
      "Ajoute le lien vers l'effet et l'effet embarqué (onglet \"Effets\") sur les 90 " +
      "désavantages qui n'en avaient pas encore. Narratif pour la plupart (la majorité " +
      "des désavantages décrivent une conséquence conditionnelle/de jeu de rôle, pas un " +
      "malus chiffré permanent) ; 3 cas ont un vrai malus de compétence (Petite nature, " +
      "Enfant, Introverti).",
    apply: applyEmbedEffetsDesavantages
  },
  {
    id: "0.6.70-backfill-ingredient-bag",
    pack: "acteurs",
    version: "0.6.70",
    label: "Sac à ingrédient — activation rétroactive",
    description:
      "Le nouvel onglet \"Ingrédients\" n'est plus visible que si la case \"Sac à ingrédient\" " +
      "(onglet Background) est cochée. Coche-la automatiquement sur tout personnage qui " +
      "possède déjà au moins un objet d'inventaire catégorisé apothicaire, pour ne pas lui " +
      "faire perdre l'accès à son propre inventaire.",
    apply: applyBackfillIngredientBag
  },
  {
    id: "0.6.72-create-effet-charge-furieuse",
    pack: "effets",
    version: "0.6.72",
    label: "Effet \"Charge furieuse\" (Capacités de combat)",
    description:
      "Crée le document Effet autonome \"Charge furieuse\" (+2 attaque, armes de corps à corps) " +
      "dans le compendium Effets — même patron que les avantages, à appliquer avant ou avec le " +
      "correctif ci-dessous.",
    apply: applyCreateEffetChargeFurieuse
  },
  {
    id: "0.6.72-link-effet-charge-furieuse",
    pack: "capacites-combat",
    version: "0.6.72",
    label: "Charge furieuse — lien vers l'effet + fiche corrigée",
    description:
      "Ajoute le lien vers l'effet dans la description de la capacité \"Charge furieuse\" " +
      "(compendium et copies déjà glissées sur un PNJ) — la première version n'avait ni le " +
      "lien, ni la bonne fiche d'objet (le type \"npcability\" n'était pas encore reconnu par " +
      "le système, corrigé dans ce même déploiement).",
    apply: applyLinkEffetChargeFurieuse
  },
  {
    id: "0.6.73-enable-effet-charge-furieuse",
    pack: "capacites-combat",
    version: "0.6.73",
    label: "Charge furieuse — bonus actif en permanence",
    description:
      "Retour utilisateur : le bonus d'attaque de \"Charge furieuse\" doit être actif en " +
      "permanence, pas désactivé par défaut. Active l'effet déjà présent (compendium et copies " +
      "déjà glissées sur un PNJ) et corrige le texte de la description en conséquence.",
    apply: applyEnableEffetChargeFurieuse
  },
  {
    id: "0.6.74-create-effet-petrifie",
    pack: "effets",
    version: "0.6.74",
    label: "Effet \"Pétrifié (Regard de Méduse)\" (Capacités de combat)",
    description:
      "Crée le document Effet autonome \"Pétrifié (Regard de Méduse)\" dans le compendium " +
      "Effets — marqueur narratif à glisser par le MJ sur la victime après un échec de jet de " +
      "sauvegarde (jamais embarqué sur la capacité elle-même). À appliquer avant ou avec le " +
      "correctif ci-dessous.",
    apply: applyCreateEffetPetrifie
  },
  {
    id: "0.6.74-link-effet-petrifie",
    pack: "capacites-combat",
    version: "0.6.74",
    label: "Regard pétrifiant — lien vers l'effet",
    description:
      "Ajoute le lien vers l'effet \"Pétrifié\" dans la description de la capacité \"Regard " +
      "pétrifiant\" (compendium et copies déjà glissées sur un PNJ).",
    apply: applyLinkEffetPetrifie
  },
  {
    id: "0.6.75-embed-effet-petrifie",
    pack: "capacites-combat",
    version: "0.6.75",
    label: "Regard pétrifiant — effet visible dans l'onglet Effets",
    description:
      "Retour utilisateur : l'onglet Effets de \"Regard pétrifiant\" restait vide (le lien " +
      "dans la description ne suffisait pas). Embarque maintenant aussi une copie de l'effet " +
      "\"Pétrifié\" directement sur la capacité, en `transfer:false` — visible dans l'onglet " +
      "Effets comme pour Charge furieuse, mais ne s'applique jamais à la créature qui possède " +
      "la capacité (compendium et copies déjà glissées sur un PNJ).",
    apply: applyLinkEffetPetrifie
  },
  {
    id: "0.6.76-add-save-to-petrifiant",
    pack: "capacites-combat",
    version: "0.6.76",
    label: "Regard pétrifiant — bouton de jet de sauvegarde",
    description:
      "Ajoute un bouton \"Jet de sauvegarde\" (Robustesse DC 18) sur la carte de chat de " +
      "\"Regard pétrifiant\" — la victime clique elle-même, sur son propre client, avec les " +
      "stats de son personnage assigné. Met aussi à jour le paragraphe de description qui " +
      "l'explique (compendium et copies déjà glissées sur un PNJ).",
    apply: applyAddSaveToPetrifiant
  },
  {
    id: "0.6.79-create-capacites-bestiaire",
    pack: "capacites-combat",
    version: "0.6.79",
    label: "51 nouvelles capacités de combat (bestiaire complet)",
    description:
      "Généralise Charge furieuse/Regard pétrifiant à tout le bestiaire : crée les 51 " +
      "documents manquants (une ou plusieurs capacités par créature de \"Créatures " +
      "Mythologiques\", sauf Pégase/Hippocampe/Cyclope qui n'ont rien à ajouter) — 6 " +
      "mécaniques (bonus d'attaque/CA embarqué), le reste narratif, comme pour les " +
      "désavantages. À appliquer avant ou avec le correctif ci-dessous.",
    apply: applyCreateCapacitesBestiaire
  },
  {
    id: "0.6.79-embed-capacites-bestiaire",
    pack: "creatures",
    version: "0.6.79",
    label: "Capacités embarquées sur chaque créature du bestiaire",
    description:
      "Embarque chaque nouvelle capacité directement sur la créature correspondante dans " +
      "\"Créatures Mythologiques\", et sur toute copie déjà glissée sur un PNJ du monde — " +
      "glisser une créature du compendium sur une scène l'amène déjà équipée. Retrofit " +
      "inclus : Minotaure/Méduse eux-mêmes n'avaient jamais reçu Charge furieuse/Regard " +
      "pétrifiant sur leur propre fiche (seulement glissés sur une copie PNJ de test).",
    apply: applyEmbedCapacitesBestiaire
  },
  {
    id: "0.6.91-fix-weapon-categories",
    pack: "armes",
    version: "0.6.91",
    label: "Catégorie d'attaque des armes corrigée",
    description:
      "Aucune arme n'a jamais eu system.category/categoryDistance explicitement défini — " +
      "toutes retombaient donc sur la valeur par défaut du schéma (\"Arme blanche\" en " +
      "mêlée, \"Arme à distance\" à distance), correcte par coïncidence seulement pour les " +
      "armes réellement \"Arme blanche\". Corrige les 100 armes du compendium et toute " +
      "copie déjà possédée par un acteur pour qu'elles pointent vers leur vraie catégorie " +
      "(Arme de jet/Arme exotique/Arme à deux mains/Arme à distance).",
    apply: applyFixWeaponCategories
  },
  {
    id: "0.6.91-create-arbalete-munitions",
    pack: "armes",
    version: "0.6.91",
    label: "Arbalète + munitions (Flèches, Carreaux, Pierres de fronde)",
    description:
      "Crée la nouvelle Arbalète (3 paliers de qualité) et un nouveau dossier \"Munition\" " +
      "avec 3 objets (Flèches, Carreaux d'arbalète, Pierres de fronde) — à lier depuis la " +
      "fiche d'une arme à distance consommable (menu \"Munition liée\") pour un vrai suivi " +
      "de stock, même mécanisme que les ingrédients d'alchimie.",
    apply: applyCreateArbaleteMunitions
  },
  {
    id: "0.6.95-fix-munition-consumable",
    pack: "armes",
    version: "0.6.95",
    label: "Munitions liables aux armes à distance",
    description:
      "Les 3 munitions (Flèches, Carreaux d'arbalète, Pierres de fronde) avaient " +
      "system.consumable à false — invisibles dans le menu \"Munition liée\" d'une arme " +
      "(qui ne liste que les objets marqués consommables). Corrigé sur le compendium et " +
      "toute copie déjà possédée par un acteur.",
    apply: applyFixMunitionConsumable
  },
  {
    id: "0.6.96-create-fleche-empoisonnee",
    pack: "armes",
    version: "0.6.96",
    label: "Flèches empoisonnées",
    description:
      "Ajoute une 4e munition dans le dossier \"Munition\" — pas d'effet de poison " +
      "automatisé (aucune arme de ce système ne déclenche de jet de sauvegarde ou de " +
      "dégâts additionnels au toucher), à résoudre manuellement par le MJ (voir sa note " +
      "MJ dédiée sur l'objet).",
    apply: applyCreateFlecheEmpoisonnee
  },
  {
    id: "0.6.93-create-tresors",
    pack: "tresors",
    version: "0.6.93",
    label: "7 premiers objets de trésor",
    description:
      "Peuple le nouveau compendium \"Trésors\" (nouveau type d'objet dédié) avec un premier " +
      "lot : Bijou orné, Parchemin scellé, Lettre cachetée, Statuette à l'effigie d'un dieu, " +
      "Flacon de parfum, Pierre précieuse, Caillou.",
    apply: applyCreateTresors
  },
  {
    id: "0.6.98-embed-spell-effects",
    pack: "sorts",
    version: "0.6.98",
    label: "Effets liés aux sorts (2 premiers exemples)",
    description:
      "Bénédiction des Titans et Danse du Serpent embarquent maintenant un vrai effet " +
      "(+3 Force / +3 Dextérité) au lieu d'un simple texte narratif — pas appliqué " +
      "automatiquement du simple fait de connaître le sort (contrairement à un " +
      "avantage), un bouton \"Appliquer l'effet\" sur la carte de lancer l'applique à la " +
      "cible. Premiers exemples avant de généraliser aux 30 autres sorts.",
    apply: applyEmbedSpellEffects
  },
  {
    id: "0.6.101-weapon-armor-real-images",
    pack: "armes",
    version: "0.6.101",
    label: "Vraies images pour 60 armes/armures (au lieu des icônes génériques)",
    description:
      "Remplace l'icône générique (un seul SVG partagé par catégorie) par une vraie image " +
      "pour 60 armes/armures — sur les ~120 images fournies, seules celles vérifiées libres " +
      "de tout filigrane/logo/marque identifiable ont été retenues (voir JOURNAL.md, séance " +
      "\"images d'équipement\"). Corrige le compendium et toute copie déjà possédée par un " +
      "acteur.",
    apply: applyWeaponArmorRealImages
  },
  {
    id: "0.6.102-embed-more-spell-effects",
    pack: "sorts",
    version: "0.6.102",
    label: "Effets liés aux sorts (5 exemples de plus + 2 sorts à bonus de CA)",
    description:
      "Suite du point précédent (Bénédiction des Titans/Danse du Serpent) : Résilience de " +
      "l'Immortel (+3 Constitution), Eveil du Sage (+3 Intelligence), Méditation des Ancêtres " +
      "(+3 Astuce), Glamour Divin (+3 Charisme) et Souffle aux Pieds Legers (+4 Initiative) " +
      "embarquent maintenant un vrai effet (bouton \"Appliquer l'effet\" au lancer). Rage " +
      "Incontrôlable et Peau de Fer récupèrent leur bonus de CA (+1 et +2) via le mécanisme " +
      "plus simple déjà utilisé par Peau d'écorce — le reste de leur effet (dégâts en dé, " +
      "réduction de dégâts) n'a pas d'équivalent automatisable et reste à l'appréciation du MJ.",
    apply: applyEmbedMoreSpellEffects
  },
  {
    id: "0.6.105-fix-spell-effect-phase",
    pack: "sorts",
    version: "0.6.105",
    label: "Bonus des 7 sorts à effet embarqué sans effet réel (Force, Dextérité, etc.)",
    description:
      "Les 7 sorts avec un effet embarqué (Bénédiction des Titans, Danse du Serpent, " +
      "Résilience de l'Immortel, Eveil du Sage, Méditation des Ancêtres, Glamour Divin, " +
      "Souffle aux Pieds Legers) n'appliquaient en fait jamais leur bonus : la fiche " +
      "recalcule le modificateur de caractéristique/l'initiative après l'effet, qui se " +
      "faisait donc systématiquement écraser. Corrige le compendium, toute copie déjà " +
      "possédée par un acteur, et toute copie sur un jeton non lié à sa fiche.",
    apply: applyFixSpellEffectPhase
  },
  {
    id: "0.6.107-fix-spell-ability-mod-cascade",
    pack: "sorts",
    version: "0.6.107",
    label: "Bonus de caractéristique des sorts pas répercuté sur les compétences liées",
    description:
      "Suite du correctif précédent : le bonus de caractéristique de 6 sorts (Bénédiction " +
      "des Titans, Danse du Serpent, Résilience de l'Immortel, Eveil du Sage, Méditation " +
      "des Ancêtres, Glamour Divin) s'affichait bien sur la caractéristique elle-même, " +
      "mais pas sur les compétences/sauvegardes/CA/bonus d'attaque qui en dépendent — " +
      "recalculés par la fiche avant que le bonus ne soit appliqué. Corrige le compendium, " +
      "toute copie déjà possédée par un acteur, et toute copie sur un jeton non lié.",
    apply: applyFixSpellEffectPhase
  },
  {
    id: "0.6.108-embed-spell-group-effects",
    pack: "sorts",
    version: "0.6.108",
    label: "Version \"groupe\" (+1) de Bénédiction des Titans et Danse du Serpent",
    description:
      "Ajoute un deuxième effet, plus faible (+1 au lieu de +3), avec son propre bouton " +
      "sur la carte de lancer — n'importe quel joueur peut se l'appliquer à lui-même " +
      "(ou l'appliquer à un allié ciblé) sans passer par le lanceur du sort.",
    apply: applyEmbedSpellGroupEffects
  },
  {
    id: "0.6.110-embed-spell-group-effect-eveil-du-sage",
    pack: "sorts",
    version: "0.6.110",
    label: "Version \"groupe\" (+1) d'Eveil du Sage",
    description:
      "Suite du correctif précédent : Eveil du Sage reçoit lui aussi un deuxième effet " +
      "(+1 Intelligence au lieu de +3), avec son propre bouton sur la carte de lancer.",
    apply: applyEmbedSpellGroupEffects
  },
  {
    id: "0.6.111-embed-spell-group-effects-batch2",
    pack: "sorts",
    version: "0.6.111",
    label: "Version \"groupe\" (+1) de Résilience de l'Immortel, Méditation des Ancêtres, Glamour Divin",
    description:
      "Suite des correctifs précédents : ces 3 sorts reçoivent eux aussi un deuxième " +
      "effet (+1 au lieu de +3), avec son propre bouton sur la carte de lancer.",
    apply: applyEmbedSpellGroupEffects
  },
  {
    id: "0.6.112-embed-spell-group-effect-souffle",
    pack: "sorts",
    version: "0.6.112",
    label: "Version \"groupe\" (+2) de Souffle aux Pieds Legers",
    description:
      "Suite des correctifs précédents : Souffle aux Pieds Legers reçoit lui aussi un " +
      "deuxième effet (+2 Initiative au lieu de +4), avec son propre bouton sur la carte " +
      "de lancer.",
    apply: applyEmbedSpellGroupEffects
  },
  {
    id: "0.6.114-create-effets-points-chance",
    pack: "effets",
    version: "0.6.114",
    label: "Effets autonomes \"Point de Chance +1\"/\"+2\" (permanents)",
    description:
      "Crée deux nouveaux documents Effet autonomes dans le compendium Effets — pas " +
      "d'Avantage ni de coût associé, à glisser manuellement par le MJ sur une fiche " +
      "Personnage pour augmenter définitivement ses Points de Chance de 1 ou 2.",
    apply: applyCreateEffetsPointsChance
  },
  {
    id: "0.6.116-embed-grace-astres-effects",
    pack: "sorts",
    version: "0.6.116",
    label: "Effets solo/groupe de Grâce des Astres Alignés (Points de Chance)",
    description:
      "Ce sort donnait déjà 1 Point de Chance à l'équipe ou 2 à une personne dans son " +
      "texte, mais n'avait jamais eu d'effet mécanique (le champ Points de Chance " +
      "n'existait pas encore). Ajoute les deux boutons, comme les 7 autres sorts à " +
      "effet embarqué.",
    apply: applyEmbedGraceAstresEffects
  },
  {
    id: "0.6.124-revert-spells-to-narrative",
    pack: "sorts",
    version: "0.6.124",
    label: "Assistance et Malédiction redeviennent purement narratifs",
    description:
      "Retire le bouton \"Lancer le dé\" et l'effet informatif tentés puis abandonnés sur " +
      "ces deux sorts — décision finale : rester purement narratif plutôt qu'un mécanisme " +
      "qui n'était ni un vrai effet applicable, ni un simple texte.",
    apply: applyRevertSpellsToNarrative
  },
  {
    id: "0.6.125-add-spell-templates",
    pack: "sorts",
    version: "0.6.125",
    label: "Gabarit de zone pour Force Déchainée et Hurlement de Bataille",
    description:
      "Ajoute le bouton \"Placer un gabarit\" (déjà utilisé pour Brouillard) à ces deux " +
      "sorts à rayon d'effet (5m et 10m) — aucun nouveau mécanisme, juste la même " +
      "fonctionnalité de gabarit de zone appliquée aux sorts qui précisent un rayon.",
    apply: applyAddSpellTemplates
  },
  {
    id: "0.6.126-fix-spell-template-visual-and-save",
    pack: "sorts",
    version: "0.6.126",
    label: "Gabarit simplifié + jet de sauvegarde pour Force Déchainée/Hurlement de Bataille",
    description:
      "Corrige le gabarit de zone de Force Déchainée/Hurlement de Bataille : la texture " +
      "(pensée pour Brouillard, une image qui se répète en boucle) se dupliquait de façon " +
      "disgracieuse sur un petit gabarit — remplacée par une simple couleur unie. Ajoute " +
      "aussi un bouton de jet de sauvegarde sur leur carte de lancer (Robustesse DC 15 pour " +
      "Force Déchainée, Volonté DC 15 pour Hurlement de Bataille), demandé par l'utilisateur " +
      "après test.",
    apply: applyFixSpellTemplateAndSave
  },
  {
    id: "0.6.127-spell-real-icons",
    pack: "sorts",
    version: "0.6.127",
    label: "Icônes propres pour les 32 sorts",
    description:
      "Remplace les 4 icônes génériques partagées par école (chêne/feu/épée/crâne) par une " +
      "icône distincte par sort, vérifiée dans la bibliothèque Foundry locale avant usage.",
    apply: applySpellRealIcons
  },
  {
    id: "0.6.129-rage-incontrolable-volonte-wording",
    pack: "sorts",
    version: "0.6.129",
    label: "Rage Incontrôlable — jet de sauvegarde de Volonté reformulé",
    description:
      "Reformule la dernière phrase de la description (\"jet de volonté\" → \"jet de " +
      "sauvegarde de Volonté\", terminologie cohérente avec le reste du système). Purement " +
      "textuel — le déclencheur reste conditionnel (tous les ennemis à terre avant la fin " +
      "de la rage), pas un bouton automatique.",
    apply: applyRageIncontrolableWording
  },
  {
    id: "0.6.131-fix-flask-icon",
    pack: "equipement",
    version: "0.6.131",
    label: "8 potions — icône cassée icons/svg/flask.svg",
    description:
      "flask.svg n'existe pas dans la bibliothèque Foundry (404 en jeu, même bug que " +
      "l'historique potion.svg) — remplacée par une vraie icône de potion distincte pour " +
      "chacune des 8 potions concernées.",
    apply: applyFixFlaskIcons
  },
  {
    id: "0.6.131-fix-water-icon",
    pack: "acteurs",
    version: "0.6.131",
    label: "Combattant aquatique / Triton — icône cassée icons/svg/water.svg",
    description:
      "water.svg n'existe pas dans la bibliothèque Foundry (404 en jeu) — remplacée par " +
      "waterfall.svg (existante), sur la capacité \"Combattant aquatique\" (son icône propre " +
      "et celle de son effet embarqué) et sur le portrait du Triton.",
    apply: applyFixWaterIcons
  },
  {
    id: "0.6.131-remove-ephise-bonus-sexe",
    pack: "acteurs",
    version: "0.6.131",
    label: "Éphise — champ résiduel system.bonusSexe",
    description:
      "Retire un champ system.bonusSexe resté sur le PNJ \"Éphise - fils d'Eros\", résidu " +
      "d'une mécanique abandonnée absente du schéma actuel (sans effet, Foundry l'ignore " +
      "déjà silencieusement — pur nettoyage de données).",
    apply: applyRemoveEphiseBonusSexe
  },
  {
    id: "0.6.133-aquatic-fighter-all-categories",
    pack: "acteurs",
    version: "0.6.133",
    label: "Combattant aquatique — bonus d'attaque étendu à toutes les catégories",
    description:
      "Le bonus d'attaque de \"Combattant aquatique\" (Triton) ne visait que les armes de " +
      "corps à corps (system.attackBonuses.armeBlanche.total) — étendu aux 6 catégories " +
      "d'attaque (choix confirmé par l'utilisateur : le bonus doit s'appliquer à toute " +
      "attaque, pas seulement au corps à corps). Le +2 CA n'est pas concerné.",
    apply: applyFixAquaticFighterScope
  },
  {
    id: "0.6.134-aquatic-fighter-duplicates-and-reset",
    pack: "acteurs",
    version: "0.6.134",
    label: "Combattant aquatique en double + remise à zéro de la CA/attaque du Triton",
    description:
      "Retire les copies en double de \"Combattant aquatique\" (objet capacité ou effet " +
      "isolé) trouvées sur un acteur ou jeton du monde, et remet la CA/les bonus d'attaque " +
      "par catégorie du Triton à leur valeur de base (15 / 0), au cas où un effet actif " +
      "aurait été réintégré comme valeur brute par l'ancien défaut de la fiche PNJ (voir " +
      "0.6.133).",
    apply: applyFixAquaticFighterDuplicates
  },
  {
    id: "0.6.135-aquatic-fighter-effect-dedup",
    pack: "acteurs",
    version: "0.6.135",
    label: "Combattant aquatique — 2 effets embarqués au lieu d'un sur la capacité elle-même",
    description:
      "La capacité \"Combattant aquatique\" portait deux copies du même effet embarqué " +
      "(visible dans l'onglet Effets de sa propre fiche, \"EFFETS (2)\") — le correctif " +
      "0.6.134 corrigeait déjà le contenu des deux sans les fusionner. N'en garde plus " +
      "qu'une seule, sur le compendium et toute copie déjà déployée (acteur, jeton non lié).",
    apply: applyFixAquaticFighterEffectDedup
  },
  {
    id: "0.6.137-effect-icons-match-parent",
    pack: "acteurs",
    version: "0.6.137",
    label: "Icône des effets embarqués désynchronisée de leur objet parent",
    description:
      "Demande de l'utilisateur : l'icône d'un effet embarqué (sort, trait, capacité de " +
      "combat...) doit toujours être la même que celle de l'objet qui le porte. Audit " +
      "statique du 21 septembre 2026 : 20 effets déjà déployés (13 avantages, 5 " +
      "désavantages, \"Regard pétrifiant\" du bestiaire) utilisaient encore une icône " +
      "générique (icons/svg/aura.svg ou hazard.svg) héritée d'anciens scripts de génération " +
      "antérieurs au patron actuel — corrigé à la source. Ce correctif réaligne aussi " +
      "génériquement toute autre copie déjà déployée dont l'icône de l'effet ne correspond " +
      "plus à celle de son objet parent, y compris pour un contenu ajouté plus tard.",
    apply: applyFixEffectIconsMatchParent
  },
  {
    id: "0.6.138-dedupe-pack-folders",
    pack: "armes",
    version: "0.6.138",
    label: "Dossiers en double dans les compendiums (Armes, Sorts, Avantages Divins, Alchimie)",
    description:
      "Signalé par l'utilisateur (capture d'écran du compendium natif \"Armes, Armures & " +
      "Boucliers\") : des dossiers vides en double, différant seulement par un accent " +
      "(\"Arme a deux mains\" / \"Arme à deux mains\") ou une majuscule (\"Arme de Jet\" / " +
      "\"Arme de jet\"), à côté du vrai dossier contenant les objets. Dérive du monde " +
      "déployé (jamais dans les données source) : la mise à jour des compendiums ne " +
      "supprime jamais un dossier absent de la source, pour ne pas effacer un dossier créé " +
      "par le MJ — un ancien dossier orphelin (avant un renommage/une réorganisation) reste " +
      "donc indéfiniment. Fusionne chaque groupe de doublons (déplace d'abord tout objet " +
      "encore présent dans un dossier en trop, puis le supprime), sur les 4 compendiums " +
      "concernés (Armes, Sorts, Avantages Divins, Alchimie — les seuls à utiliser des " +
      "dossiers).",
    apply: applyDedupePackFolders
  },
  {
    id: "0.6.138-weapon-images-unlinked-tokens",
    pack: "armes",
    version: "0.6.138",
    label: "Vraies images des armes/armures — copies sur un jeton non lié",
    description:
      "Le correctif 0.6.101 (vraies images pour 60 armes/armures) ne parcourait que le " +
      "compendium et les objets déjà possédés par un acteur — pas les copies sur un jeton " +
      "non lié à sa fiche (même angle mort déjà corrigé ailleurs pour d'autres correctifs, " +
      "ex. 0.6.105/0.6.131). Ajouté.",
    apply: applyWeaponArmorImagesUnlinkedTokens
  },
  {
    id: "0.6.139-trait-icons",
    pack: "avantages",
    version: "0.6.139",
    label: "Icônes distinctes pour les avantages, désavantages et bénédictions",
    description:
      "Demande de l'utilisateur. Les avantages/désavantages partageaient tous l'une de 2 " +
      "icônes génériques (upgrade.svg/downgrade.svg), et les 60 avantages + 60 " +
      "désavantages liés à une dévotion partageaient tous sun.svg — remplacés par une " +
      "icône propre par item (un icône par dieu, partagé entre bénédiction et malédiction " +
      "du même dieu, sur les 4 paliers), toutes vérifiées présentes dans l'installation " +
      "Foundry locale avant usage. Corrige le compendium et toute copie déjà possédée par " +
      "un acteur ou un jeton non lié.",
    apply: applyFixTraitIcons
  },
  {
    id: "0.6.140-advantage-real-images",
    pack: "avantages",
    version: "0.6.140",
    label: "Vraies images pour 65 avantages",
    description:
      "L'utilisateur a fourni ses propres images pour les 94 avantages — sur les 94, 65 " +
      "sont utilisées ici (les 29 restantes sont soit un fichier corrompu/illisible, soit " +
      "porteuses d'un filigrane visible d'une banque d'images — Dreamstime, Shutterstock, " +
      "Adobe Stock, Alamy, jedessine.com, yodibujo.com — et gardent donc l'icône générique " +
      "du correctif 0.6.139, comme les 16/74 images d'armes déjà exclues au point 47 pour " +
      "la même raison). Réutilise applyFixTraitIcons() (table TRAIT_ICONS déjà mise à jour " +
      "avec ces 65 nouveaux chemins) — un seul mécanisme pour toute icône de trait, qu'elle " +
      "vienne de la bibliothèque Foundry ou d'une image fournie par l'utilisateur.",
    apply: applyFixTraitIcons
  },
  {
    id: "0.6.141-legacy-effect-shape",
    pack: "acteurs",
    version: "0.6.141",
    label: "CRITIQUE — 64 effets embarqués dans un format hérité, sans effet réel",
    description:
      "Signalé par l'utilisateur : \"Bénédiction des Titans n'a plus d'effet applicable\", " +
      "puis confirmé sur \"Danse du Serpent\". Cause trouvée : 64 effets embarqués (les 8 " +
      "sorts à bonus de caractéristique/16 effets, 9 armures, 26 avantages/désavantages, " +
      "12 bénédictions, 7 objets embarqués sur Éphise) utilisaient un format hérité — champ " +
      "\"icon\" au lieu de \"img\" (le vrai champ du schéma ActiveEffect), et \"changes\" à " +
      "la racine au lieu de \"system.changes\" (le vrai emplacement, un TypeDataField). " +
      "Résultat concret : le bouton \"Appliquer l'effet\" de ces 8 sorts ne s'affichait " +
      "plus du tout (item.mjs teste effects.some(e => e.changes.length > 0), qui ne " +
      "trouvait rien dans ce format). Les 9 armures étaient probablement affectées de la " +
      "même façon (bonus de CA jamais appliqué). Corrigé à la source sur les 6 packs " +
      "concernés + ce correctif qui réaligne toute copie déjà déployée (compendium, objets/" +
      "acteurs du monde, jetons non liés) — supprime explicitement les deux champs hérités " +
      "pour empêcher toute réintroduction future via la migration native de Foundry.",
    apply: applyFixLegacyEffectShape
  },
  {
    id: "0.6.142-remove-invalid-effect-type-items",
    pack: "acteurs",
    version: "0.6.142",
    label: "Résidus d'objets de type \"effect\" (invalides depuis le point 71)",
    description:
      "Trouvé en creusant le point 75 : plusieurs objets du monde de l'utilisateur (dont " +
      "au moins 2 sur un même acteur) étaient encore de type \"effect\" — un type retiré " +
      "des 3 manifestes au point 71 (résidu de l'ancien chantier Effets-comme-Item, " +
      "remplacé depuis par les vrais ActiveEffect). Foundry rejette désormais leur " +
      "construction à chaque chargement (erreur console systématique, sans bloquer le " +
      "reste). Utilise le mécanisme natif de Foundry pour les documents invalides " +
      "(`collection.invalidDocumentIds`/`_source`, qui échappent à toute boucle normale " +
      "sur `actor.items`) pour les repérer et les supprimer, sur le monde entier (objets, " +
      "acteurs, jetons non liés).",
    apply: applyFixInvalidEffectTypeItems
  },
  {
    id: "0.6.143-legacy-effect-shape-v2",
    pack: "acteurs",
    version: "0.6.143",
    label: "CRITIQUE — correctif 0.6.141 rejoué : il vidait les effets au lieu de les réparer",
    description:
      "Le correctif 0.6.141 ci-dessus a été confirmé bogué par l'utilisateur : au lieu de " +
      "réparer la forme des 64 effets hérités, il les a VIDÉS (effects: [] au lieu du " +
      "contenu attendu) sur sa copie déjà déployée — probablement un effet de bord de " +
      "Foundry quand un changement de \"type\" et un champ \"system\" imbriqué arrivent " +
      "dans le même appel update(). Réparé dans l'immédiat via \"Écraser mes compendiums\" " +
      "(remplacement complet du document depuis le miroir déjà correct). Ce correctif " +
      "reprend le même travail que 0.6.141 mais avec un mécanisme plus sûr : supprime " +
      "l'effet mal formé puis en recrée un neuf (keepId) au lieu de tenter une mise à jour " +
      "partielle — jamais les deux opérations dans le même appel. Porte un id neuf (0.6.141 " +
      "reste déjà cochée chez l'utilisateur) pour être proposé même à qui l'aurait déjà " +
      "coché.",
    apply: applyFixLegacyEffectShape
  },
  {
    id: "0.6.144-legacy-effect-shape-v3",
    pack: "acteurs",
    version: "0.6.144",
    label: "CRITIQUE — correctif 0.6.143 insuffisant : l'effet était déjà vidé, pas juste mal formé",
    description:
      "0.6.143 a été appliqué sans erreur mais \"rien n'a changé\" côté utilisateur — cause : " +
      "0.6.143 ne savait réparer un effet que s'il était encore présent (juste mal formé), " +
      "pas s'il avait déjà été vidé par le bug de 0.6.141. La fonction cherche désormais " +
      "chaque effet attendu par NOM sur l'objet, qu'il existe encore (mal formé) ou pas du " +
      "tout (déjà vidé), et le (re)crée dans les deux cas — \"Écraser mes compendiums\" " +
      "n'est plus un prérequis. Même mécanisme (suppression puis recréation, keepId), id " +
      "neuf puisque 0.6.143 est déjà cochée chez l'utilisateur.",
    apply: applyFixLegacyEffectShape
  }
];

const SIMPLE_NAMES = [
  "Guerrier Aguerri", "Equilibre félin", "Fetard", "Bon sens", "Commercant",
  "Visage passe partout", "Sommeil leger", "Faveur", "Respect d'Héra",
  "Branchies de Poséidon", "Rage d'Arès", "Soin d'Apollon", "Chasse d'Artèmis",
  "Beauté d'Aphrodite", "Mains d'Hèrmès", "Ivresse de Dionysos", "Chaleur d'Hestia",
  "Vue d'Hécate", "Don d'Hadès", "Chrono sens", "Ami des animaux", "Ambidextrie",
  "Charme d'Aphrodite", "Casque d'Hadès"
];

function cleanName(name) {
  return name.replace(/^\(-?\d+\)\s*/, "");
}

async function embedMissingEffect(doc) {
  const name = cleanName(doc.name);
  if (!SIMPLE_NAMES.includes(name)) return false;
  if (doc.effects.size) return false;

  await doc.createEmbeddedDocuments("ActiveEffect", [{
    name,
    img: doc.img,
    "system.changes": [],
    disabled: false,
    transfer: true
  }]);
  return true;
}

/** Voir packs/_fix-embed-effets-simple-live.js, dont cette fonction reprend la logique. */
async function applyEmbedEffetsSimple() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const entry of index) {
      if (entry.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(entry.name))) continue;
      const doc = await pack.getDocument(entry._id);
      if (await embedMissingEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(item.name))) continue;
      if (await embedMissingEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-effets-batch2.js, dont ces données/fonctions reprennent la logique. */
const EFFETS_BATCH2 = [
  { id: "eEft000000000029", name: "Orientation", img: "icons/svg/upgrade.svg", description: "<p>Vous savez toujours vous reperer dans l'espace</p>" },
  { id: "eEft000000000030", name: "Porte bouclier", img: "icons/svg/upgrade.svg", description: "<p>Vous avez un avantage lorsque vous étes le bouclier d'un autre</p>" },
  { id: "eEft000000000031", name: "Don des langues", img: "icons/svg/upgrade.svg", description: "<p>Polyglotte</p>" },
  { id: "eEft000000000032", name: "Volonté de fer", img: "icons/svg/upgrade.svg", description: "<p>vous n'avez peur de rien et vous etes rarement prit au dépourvu</p>" },
  { id: "eEft000000000033", name: "Maitre d'Arme", img: "icons/svg/upgrade.svg", description: "<p>Vous etes un maitre du maniement d'une arme +2 si vous l'utilisez</p>" },
  { id: "eEft000000000034", name: "Maitre des forges", img: "icons/svg/upgrade.svg", description: "<p>Votre talent en forgeronerie vous permet de construire ou reparer en toute circonstance</p>" },
  { id: "eEft000000000035", name: "Faveur +", img: "icons/svg/upgrade.svg", description: "<p>Un membre respecté vous dois une faveur (au choix)</p>" },
  { id: "eEft000000000036", name: "Etincelle de Zeus", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Zeus</p><p>1/4 chance de Stun 1 tour avec une arme</p>" },
  { id: "eEft000000000037", name: "Vision d'Héra", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hera</p><p>1 fois par jour: permet d'avoir des Info sur une personne connu</p>" },
  { id: "eEft000000000038", name: "Voix d'Athéna", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Athéna</p><p>Peut forcer quelqu'un a obeir a un ordre 1/j</p>" },
  { id: "eEft000000000039", name: "Moisson de Déméter", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Demeter</p><p>Permet de trouver de la nourriture (végétaux)</p>" },
  { id: "eEft000000000040", name: "Talent de Dionysos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Resistance à la drogue et l'alcool</p>" },
  { id: "eEft000000000041", name: "Flamme d'Hestia", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hestia</p><p>Votre corps est plus chaud que la moyenne pas de pénalité froid/humide</p>" },
  { id: "eEft000000000042", name: "Lanterne d'Hécate", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hécate</p><p>Permet de voir dans le noir</p>" },
  { id: "eEft000000000043", name: "Dieu de l'esquive", img: "icons/svg/upgrade.svg", description: "<p>L'esquive est un art que vous maitrisez, vous n'etes pas limité dans votre nombre d'esquive</p>" },
  { id: "eEft000000000044", name: "Dieu du stade", img: "icons/svg/upgrade.svg", description: "<p>Vos capacités athétiques sont un atout majeur, vous ne fatiguez pas si facilement</p>" },
  { id: "eEft000000000045", name: "Dieu de la guerre", img: "icons/svg/upgrade.svg", description: "<p>Si vous choisissez d'attaquer une seconde fois, aucun malus ne vous sera ajouter</p>" },
  { id: "eEft000000000046", name: "Rageux", img: "icons/svg/upgrade.svg", description: "<p>Sous l'effet de la rage, vos coups font plus mal mais vous avez tendance a voir rouge</p>" },
  { id: "eEft000000000047", name: "Faveur ++", img: "icons/svg/upgrade.svg", description: "<p>Un haut membre vous dois une faveur (au choix)</p>" },
  { id: "eEft000000000048", name: "Sang de Zeus", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Zeus</p><p>Extra Life</p>" },
  { id: "eEft000000000049", name: "Paume de Poséidon", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Offre un Bateau Magique</p>" },
  { id: "eEft000000000050", name: "Esprit d'Athéna", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Athéna</p><p>Athéna elle même vous préviens lorsque vous faite le mauvais choix</p>" },
  { id: "eEft000000000051", name: "Armure d'Arès", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Arès</p><p>Frénesie apres deux kills qui double les PV temporaire</p>" },
  { id: "eEft000000000052", name: "Blé de Déméter", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Demeter</p><p>Permet de régénerer 3 fois plus de Pv en mangeant.</p>" },
  { id: "eEft000000000053", name: "Oeil d'Apollon", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Apollon</p><p>Oracle (vision dans le sommeil)</p>" },
  { id: "eEft000000000054", name: "Compagnon d'Artèmis", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Animal magique</p>" },
  { id: "eEft000000000055", name: "Yeux d'Héphaistos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Permet de détécter la magie et les enchantements</p>" },
  { id: "eEft000000000056", name: "Murmure d'Aphrodite", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Permet d'Obtenir de sombre secrets sur une personne connus</p>" },
  { id: "eEft000000000057", name: "Message d'Hermes", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hermes</p><p>Permet de transmettre des messages court et simple à des alliés</p>" },
  { id: "eEft000000000058", name: "Amphore de Dionysos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Permet de récuperer tout ces PV avec de l'alcool/ 1j</p>" },
  { id: "eEft000000000059", name: "Bucher d'Héstia", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hestia</p><p>Permet de creer un feu qui apporte protection et comfort</p>" },
  { id: "eEft000000000060", name: "Lune d'Hécate", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hécate</p><p>Permet un rituel par nuit</p>" }
];

function effetDocData(entry) {
  return {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
    type: "base",
    system: { changes: [] },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsBatch2() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_BATCH2.filter(e => !existingIds.has(e.id)).map(effetDocData);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndEmbedBatch2(doc, entry) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${entry.id}]{${entry.name}}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: entry.name,
      img: entry.img,
      "system.changes": [],
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyEmbedEffetsBatch2() {
  const byName = new Map(EFFETS_BATCH2.map(e => [e.name, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndEmbedBatch2(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndEmbedBatch2(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-effets-batch3-mechaniques.js, dont ces données/fonctions reprennent la logique. */
const EFFETS_BATCH3 = [
  { id: "eEft000000000061", advName: "Mire d'Artèmis", effetName: "Mire d'Artèmis", selfEmbed: true, changes: [{ key: "system.attackBonuses.armeADistance.damageBonus", type: "add", value: "3" }], description: "<p>+3 aux dégâts de toutes les armes à distance, tant que cet effet est actif.</p>" },
  { id: "eEft000000000062", advName: "Talent d'Héphaistos", effetName: "Talent d'Héphaistos", selfEmbed: true, changes: [{ key: "system.attackBonuses.armeBlanche.damageBonus", type: "add", value: "3" }], description: "<p>+3 aux dégâts de toutes les armes au corps à corps, tant que cet effet est actif.</p>" },
  { id: "eEft000000000063", advName: "Pieds d'Hermes", effetName: "Pieds d'Hermes", selfEmbed: true, changes: [{ key: "system.deplacement", type: "add", value: "6" }], description: "<p>+6m de déplacement, tant que cet effet est actif.</p>" },
  { id: "eEft000000000064", advName: "Aura de Zeus", effetName: "Allié de l'aura de Zeus", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000065", advName: "Aura d'Héra", effetName: "Allié de l'aura d'Héra", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000066", advName: "Aura de Poséidon", effetName: "Allié de l'aura de Poséidon", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000067", advName: "Aura d'Athéna", effetName: "Allié de l'aura d'Athéna", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000068", advName: "Aura d'Arès", effetName: "Allié de l'aura d'Arès", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000069", advName: "Aura de Demeter", effetName: "Allié de l'aura de Demeter", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000070", advName: "Aura d'Apollon", effetName: "Allié de l'aura d'Apollon", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000071", advName: "Aura d'Artèmis", effetName: "Allié de l'aura d'Artèmis", selfEmbed: true, changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Dextérité tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000072", advName: "Aura d'Héphaïstos", effetName: "Allié de l'aura d'Héphaïstos", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000073", advName: "Aura d'Aphrodite", effetName: "Allié de l'aura d'Aphrodite", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000074", advName: "Aura d'Hermes", effetName: "Allié de l'aura d'Hermes", selfEmbed: true, changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Dextérité tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000075", advName: "Aura de Dionysos", effetName: "Allié de l'aura de Dionysos", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000076", advName: "Aura d'Hestia", effetName: "Allié de l'aura d'Hestia", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000077", advName: "Aura d'Hécate", effetName: "Allié de l'aura d'Hécate", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000078", advName: "Aura d'Hadès", effetName: "Allié de l'aura d'Hadès", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" }
];

function effetDocDataBatch3(entry) {
  return {
    _id: entry.id,
    name: entry.effetName,
    img: "icons/svg/sun.svg",
    type: "base",
    system: { changes: entry.changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsBatch3() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_BATCH3.filter(e => !existingIds.has(e.id)).map(effetDocDataBatch3);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndMaybeEmbedBatch3(doc, entry) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${entry.id}]{${entry.effetName}}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (entry.selfEmbed && !doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: entry.effetName,
      img: doc.img,
      "system.changes": entry.changes,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEmbedEffetsBatch3() {
  const byName = new Map(EFFETS_BATCH3.map(e => [e.advName, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndMaybeEmbedBatch3(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndMaybeEmbedBatch3(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_embed-auras-on-advantages.js, dont cette fonction reprend la logique. */
async function embedAuraEffect(doc, entry) {
  if (doc.effects.size) return false;

  await doc.createEmbeddedDocuments("ActiveEffect", [{
    name: entry.effetName,
    img: doc.img,
    "system.changes": entry.changes,
    disabled: false,
    transfer: true
  }]);
  return true;
}

async function applyEmbedAuras() {
  const auras = EFFETS_BATCH3.filter(e => !e.selfEmbed);
  const byName = new Map(auras.map(e => [e.advName, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedAuraEffect(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await embedAuraEffect(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/avantages.db (champ Faveur de la Dame) — simple correction de champ, pas
 *  d'ActiveEffect impliqué. Idempotent : ne touche pas une copie déjà configurée ou dont
 *  le compteur a déjà été entamé par le joueur (ne réinitialise jamais une valeur en cours). */
async function setFaveurDeLaDameLimitation(doc) {
  if (doc.system.limitation === 3) return false;
  await doc.update({ "system.limitation": 3, "system.limitationValue": 3 });
  return true;
}

async function applySetFaveurDeLaDameLimitation() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Faveur de la Dame") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setFaveurDeLaDameLimitation(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Faveur de la Dame") continue;
      if (await setFaveurDeLaDameLimitation(item)) fixed++;
    }
  }

  return fixed;
}

const ATHLETE_CHANGES = [{ key: "system.deplacement", type: "multiply", value: "2" }];

/**
 * Ensures exactly one correctly-shaped embedded effect on an Athlète doc (compendium or
 * owned copy) — adds it if missing, trims duplicates down to one if there are several,
 * fixes the changes if the surviving one is wrong. Idempotent, safe to rerun.
 */
async function fixAthleteEffect(doc) {
  if (doc.effects.size === 0) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Athléte",
      img: doc.img,
      "system.changes": ATHLETE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    return true;
  }

  let changed = false;

  if (doc.effects.size > 1) {
    const [, ...extraIds] = Array.from(doc.effects.keys());
    await doc.deleteEmbeddedDocuments("ActiveEffect", extraIds);
    changed = true;
  }

  const kept = doc.effects.contents[0];
  const keptChanges = (kept.system.changes ?? []).map(c => ({ key: c.key, type: c.type, value: c.value }));
  if (JSON.stringify(keptChanges) !== JSON.stringify(ATHLETE_CHANGES)) {
    await kept.update({ "system.changes": ATHLETE_CHANGES });
    changed = true;
  }

  return changed;
}

async function applyFixAthleteEffect() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Athléte") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixAthleteEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Athléte") continue;
      if (await fixAthleteEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Backfills system.hasIngredientBag on any character who already has at least one
 *  apothCategory item, so the new tab-visibility toggle doesn't hide an inventory
 *  the player already built (see character-sheet.hbs's nav guard on this field). */
async function applyBackfillIngredientBag() {
  let fixed = 0;

  for (const actor of game.actors ?? []) {
    if (actor.type !== "character" || actor.system.hasIngredientBag) continue;
    const hasIngredients = actor.items.some(i => i.type === "equipment" && i.system.apothCategory);
    if (!hasIngredients) continue;
    await actor.update({ "system.hasIngredientBag": true });
    fixed++;
  }

  return fixed;
}

/** Voir packs/_build-capacites-combat.js, dont ces données/fonctions reprennent la logique.
 *  Même patron que Mule (MULE_EFFET_ID et consorts, plus haut) : un document Effet
 *  autonome dans le compendium "effets" (bibliothèque générale, réutilisable/glissable
 *  sur n'importe quel token) + un lien vers ce document dans la description de la
 *  capacité, en plus de la copie déjà embarquée sur l'objet lui-même. */
const CHARGE_FURIEUSE_EFFET_ID = "eEft000000000170";
const CHARGE_FURIEUSE_CHANGES = [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }];
const CHARGE_FURIEUSE_EFFET_DESCRIPTION = "<p>+2 à l'attaque (armes de corps à corps), tant que cet effet est actif.</p>";

async function applyCreateEffetChargeFurieuse() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === CHARGE_FURIEUSE_EFFET_ID)) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: CHARGE_FURIEUSE_EFFET_ID,
    name: "Charge furieuse",
    img: "icons/svg/sword.svg",
    type: "base",
    system: { changes: CHARGE_FURIEUSE_CHANGES },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: CHARGE_FURIEUSE_EFFET_DESCRIPTION,
    transfer: true
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

async function linkChargeFurieuseEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${CHARGE_FURIEUSE_EFFET_ID}]{Charge furieuse}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Charge furieuse",
      img: doc.img,
      "system.changes": CHARGE_FURIEUSE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEffetChargeFurieuse() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Charge furieuse") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkChargeFurieuseEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Charge furieuse") continue;
      if (await linkChargeFurieuseEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Retour utilisateur après test de la 0.6.72 : le bonus doit être actif en permanence, pas
 *  désactivé par défaut (revirement par rapport au choix initial de "conditionnel, à activer
 *  pendant la charge") — corrige l'effet embarqué déjà créé désactivé par le correctif
 *  ci-dessus, sur le compendium et toute copie déjà glissée sur un PNJ. */
async function enableChargeFurieuseEffect(doc) {
  let changed = false;

  const effect = doc.effects.find(e => e.name === "Charge furieuse");
  if (effect?.disabled) {
    await effect.update({ disabled: false });
    changed = true;
  }

  const oldText = "(effet ci-dessous, désactivé par défaut — à activer pendant la charge, désactiver ensuite)";
  if (doc.system.description?.includes(oldText)) {
    await doc.update({
      "system.description": doc.system.description.replace(oldText, "(effet ci-dessous, actif en permanence)")
    });
    changed = true;
  }

  return changed;
}

async function applyEnableEffetChargeFurieuse() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Charge furieuse") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await enableChargeFurieuseEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Charge furieuse") continue;
      if (await enableChargeFurieuseEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-capacites-combat.js. Contrairement à Charge furieuse, cet effet n'est
 *  JAMAIS embarqué sur la capacité "Regard pétrifiant" elle-même (transfer:true
 *  l'appliquerait à la créature qui possède la capacité, pas à sa victime) — juste un lien
 *  dans la description, à glisser manuellement par le MJ sur le token de la victime après un
 *  échec de jet de sauvegarde. Marqueur narratif (aucun `changes`), même principe que la
 *  majorité des effets de désavantages. */
const PETRIFIE_EFFET_ID = "eEft000000000171";
const PETRIFIE_EFFET_DESCRIPTION =
  "<p>Changée en statue de pierre : immobilisée, incapable d'agir. Marqueur narratif — à " +
  "retirer manuellement par le MJ quand la situation le justifie.</p>";

async function applyCreateEffetPetrifie() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === PETRIFIE_EFFET_ID)) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: PETRIFIE_EFFET_ID,
    name: "Pétrifié (Regard de Méduse)",
    img: "icons/svg/downgrade.svg",
    type: "base",
    system: { changes: [] },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: PETRIFIE_EFFET_DESCRIPTION,
    transfer: false
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

async function linkPetrifieEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${PETRIFIE_EFFET_ID}]{Pétrifié (Regard de Méduse)}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({
      "system.description": doc.system.description +
        "<p><em>Le jet de sauvegarde reste géré manuellement par le MJ. En cas d'échec, glisser " +
        "l'effet ci-dessous directement sur le token de la victime :</em></p>" +
        `<p>${uuidLink}</p>`
    });
    changed = true;
  }

  // transfer:false : reste visible dans l'onglet Effets de la capacité (même patron visuel
  // que Charge furieuse), retour utilisateur du 10 septembre 2026 — mais ne s'applique
  // jamais à la créature qui possède la capacité (contrairement à un effet transfer:true).
  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Pétrifié (Regard de Méduse)",
      img: "icons/svg/downgrade.svg",
      "system.changes": [],
      disabled: false,
      transfer: false,
      description: "Changée en statue de pierre : immobilisée, incapable d'agir."
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEffetPetrifie() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Regard pétrifiant") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkPetrifieEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Regard pétrifiant") continue;
      if (await linkPetrifieEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Retour utilisateur : bouton "Jet de sauvegarde" (Robustesse DC 18) sur la carte de chat
 *  de "Regard pétrifiant", pour que la victime lance elle-même son jet — voir
 *  packs/_build-capacites-combat.js et AntiqueItem#postToChat. Backfill des champs
 *  saveAbility/saveDC (absents des versions précédentes) + remplacement du paragraphe
 *  de description devenu obsolète ("le jet de sauvegarde reste géré manuellement par le
 *  MJ", qui ne mentionnait pas encore le bouton). */
async function addSaveToPetrifiant(doc) {
  let changed = false;

  if (!doc.system.saveAbility || !doc.system.saveDC) {
    await doc.update({ "system.saveAbility": "robustesse", "system.saveDC": 18 });
    changed = true;
  }

  const oldText =
    "<p><em>Le jet de sauvegarde reste géré manuellement par le MJ. En cas d'échec, glisser " +
    "l'effet ci-dessous directement sur le token de la victime :</em></p>";
  const newText =
    "<p><em>Poster cette capacité dans le chat (clic sur son nom ou son icône) fait " +
    "apparaître un bouton pour que la victime lance elle-même son jet de sauvegarde. En cas " +
    "d'échec, glisser l'effet ci-dessous directement sur le token de la victime :</em></p>";
  if (doc.system.description?.includes(oldText)) {
    await doc.update({ "system.description": doc.system.description.replace(oldText, newText) });
    changed = true;
  }

  return changed;
}

async function applyAddSaveToPetrifiant() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Regard pétrifiant") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await addSaveToPetrifiant(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Regard pétrifiant") continue;
      if (await addSaveToPetrifiant(item)) fixed++;
    }
  }

  return fixed;
}

/**
 * Voir packs/_build-capacites-bestiaire.js, dont ces données reprennent la sortie
 * exacte — généralisation du point 20 de TODO_BUG_ANTIQUE.md à tout le bestiaire
 * (26 créatures en plus de Minotaure/Méduse, déjà propagées via les correctifs
 * 0.6.72-0.6.76 ci-dessus). `changes`/`transfer` présents = capacité mécanique
 * (ActiveEffect embarqué, transfer:true, actif en permanence) ; sinon narrative
 * (saveAbility/saveDC quand le texte d'origine précise un jet de sauvegarde).
 */
const CAPACITES_BESTIAIRE = [
  { id: "aNca000000000003", creature: "Hydre de Lerne", name: "Régénération", img: "icons/svg/regen.svg", description: "<p>Récupère <strong>5 PV par tour</strong>. Si une tête est tranchée, deux repoussent au tour suivant (+2 à l'attaque tant qu'elles ne sont pas retranchées). Le feu empêche la régénération.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000004", creature: "Hydre de Lerne", name: "Souffle venimeux", img: "icons/svg/poison.svg", description: "<p>Son haleine est mortelle dans un rayon de 3m (1d8 poison).</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000005", creature: "Cerbère", name: "Trois têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer trois cibles différentes par tour. Avantage aux jets de perception (ne peut être surpris).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000006", creature: "Cerbère", name: "Queue serpent", img: "icons/svg/poison.svg", description: "<p>Attaque supplémentaire de queue, indépendante des trois têtes (1d6+2 poison).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000007", creature: "Chimère", name: "Souffle de feu (jet de sauvegarde)", img: "icons/svg/fire.svg", description: "<p>Cône de 5m, 3d6 dégâts de feu (moitié en cas de réussite). Utilisable tous les 2 tours. Complète l'attaque déjà représentée par l'arme \"Souffle de feu\" — donne le bouton de jet de sauvegarde.</p>", saveAbility: "reflexes", saveDC: 15, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000008", creature: "Chimère", name: "Triple menace", img: "icons/svg/combat.svg", description: "<p>Tête de lion (morsure), corps de chèvre (charge), queue serpent (poison) : trois modes d'attaque distincts au choix du MJ.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000009", creature: "Sphinx", name: "Énigme mortelle", img: "icons/svg/daze.svg", description: "<p>Pose une énigme (Intelligence diff 20 ou Astuce diff 18). Échec = la proie se fige de terreur (paralysée 1 tour) puis est dévorée.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000010", creature: "Sphinx", name: "Attaque en piqué", img: "icons/svg/wing.svg", description: "<p><strong>+2 à l'attaque</strong> (effet ci-dessous, actif en permanence) lors d'une attaque menée depuis les airs.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }], transfer: true, effectDesc: "+2 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000011", creature: "Griffon", name: "Attaque en piqué (Griffon)", img: "icons/svg/wing.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +2 aux dégâts (à ajouter manuellement, aucun champ de bonus de dégâts séparé n'existe pour les armes de PNJ) lors d'une attaque en piqué.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000012", creature: "Scylla", name: "Six têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer jusqu'à 6 cibles différentes par tour.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000013", creature: "Scylla", name: "Attaque éclair", img: "icons/svg/lightning.svg", description: "<p>Ses cous s'allongent à une vitesse fulgurante — la victime n'a droit qu'à un jet de Réflexes pour esquiver.</p>", saveAbility: "reflexes", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000014", creature: "Charybde", name: "Maelström", img: "icons/svg/hazard.svg", description: "<p>Trois fois par jour, aspire tout dans un rayon de 30m (Navigation diff 22 pour y échapper). Un navire pris dans le tourbillon est détruit en 3 tours.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000015", creature: "Sirène", name: "Chant envoûtant", img: "icons/svg/sound.svg", description: "<p>Échec = la victime est charmée et se dirige vers la Sirène. Portée 200m. Se boucher les oreilles avec de la cire annule l'effet.</p>", saveAbility: "volonte", saveDC: 20, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000016", creature: "Triton", name: "Combattant aquatique", img: "icons/svg/waterfall.svg", description: "<p><strong>+3 à l'attaque et +2 à la CA</strong> (effet ci-dessous, actif en permanence) quand il combat dans l'eau.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.mainNue.total", type: "add", value: "3" }, { key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }, { key: "system.attackBonuses.armeDeJet.total", type: "add", value: "3" }, { key: "system.attackBonuses.armeExotique.total", type: "add", value: "3" }, { key: "system.attackBonuses.combatDeuxMains.total", type: "add", value: "3" }, { key: "system.attackBonuses.armeADistance.total", type: "add", value: "3" }, { key: "system.ca.value", type: "add", value: "2" }], transfer: true, effectDesc: "+3 à l'attaque (toutes catégories) et +2 à la CA, tant que cet effet est actif." },
  { id: "aNca000000000017", creature: "Centaure guerrier", name: "Charge de cavalerie", img: "icons/svg/sword.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +4 aux dégâts (à ajouter manuellement) en charge directe (5m minimum en ligne droite).</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000018", creature: "Centaure guerrier", name: "Piétinement", img: "icons/svg/combat.svg", description: "<p>Peut piétiner un adversaire au sol (1d8+4 contondant).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000019", creature: "Satyre", name: "Musique de Pan", img: "icons/svg/sound.svg", description: "<p>Joue de la flûte (syrinx) : peut charmer, effrayer ou endormir, au choix du MJ.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000020", creature: "Satyre", name: "Agilité forestière", img: "icons/svg/wing.svg", description: "<p>Se déplace sans bruit en forêt. Avantage en discrétion en milieu naturel.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000021", creature: "Harpie", name: "Vol rapide", img: "icons/svg/wing.svg", description: "<p>Extrêmement rapide en vol, très difficile à attraper.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000022", creature: "Harpie", name: "Puanteur", img: "icons/svg/poison.svg", description: "<p>Aura nauséabonde dans un rayon de 3m. Échec = -2 à toutes les actions tant que la cible reste dans le rayon.</p>", saveAbility: "robustesse", saveDC: 12, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000023", creature: "Harpie", name: "Larcin aérien", img: "icons/svg/hazard.svg", description: "<p>Peut voler un objet en vol — la victime peut tenter d'en empêcher le vol.</p>", saveAbility: "reflexes", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000024", creature: "Empusa", name: "Métamorphose (Empusa)", img: "icons/svg/mystery-man.svg", description: "<p>Prend l'apparence d'une belle femme (Perception diff 18 pour voir à travers l'illusion).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000025", creature: "Empusa", name: "Drain vital", img: "icons/svg/blood.svg", description: "<p>Sa morsure draine 1d6 PV supplémentaires qu'elle absorbe.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000026", creature: "Lamie", name: "Métamorphose (Lamie)", img: "icons/svg/mystery-man.svg", description: "<p>Peut prendre forme humaine (Perception diff 16 pour la détecter).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000027", creature: "Lamie", name: "Constriction (Lamie)", img: "icons/svg/net.svg", description: "<p>En forme serpentine, peut enserrer une cible (1d6+2 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000028", creature: "Lamie", name: "Yeux amovibles", img: "icons/svg/eye.svg", description: "<p>Peut retirer ses yeux pour les cacher. Sans yeux : immunisée aux effets visuels mais aveugle.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000029", creature: "Python", name: "Constriction (Python)", img: "icons/svg/net.svg", description: "<p>Enserre sa proie (2d6+5 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 20, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000030", creature: "Python", name: "Venin (Python)", img: "icons/svg/poison.svg", description: "<p>Morsure empoisonnée (2d6 poison et affaibli en cas d'échec).</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000031", creature: "Python", name: "Gardien de l'Oracle", img: "icons/svg/mage-shield.svg", description: "<p>Résistance à la magie (avantage aux jets contre les sorts).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000032", creature: "Spectre du Styx", name: "Incorporel", img: "icons/svg/frozen.svg", description: "<p>Les armes normales passent à travers (demi-dégâts). Les armes de bronze béni ou divines infligent des dégâts pleins.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000033", creature: "Spectre du Styx", name: "Gémissement", img: "icons/svg/terror.svg", description: "<p>Pousse un cri terrifiant. Échec = effrayé pendant 1d4 tours.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000034", creature: "Érinye (Furie)", name: "Traque implacable", img: "icons/svg/eye.svg", description: "<p>Détecte automatiquement la culpabilité. Ne peut être semée ni trompée par un coupable.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000035", creature: "Érinye (Furie)", name: "Fouet enflammé (jet de sauvegarde)", img: "icons/svg/fire.svg", description: "<p>Inflige douleur et folie. Échec = la victime est prise de terreur et de remords paralysants. Complète l'attaque déjà représentée par l'arme \"Fouet enflammé\" — donne le bouton de jet de sauvegarde.</p>", saveAbility: "volonte", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000036", creature: "Érinye (Furie)", name: "Vol (Érinye)", img: "icons/svg/wing.svg", description: "<p>Ailes de chauve-souris, vol rapide.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000037", creature: "Carcinos", name: "Prise broyeuse (immobilisation)", img: "icons/svg/net.svg", description: "<p>Agrippe et broie (1d8+4 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 18, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000038", creature: "Géant (Gigante)", name: "Fils de Gaïa", img: "icons/svg/regen.svg", description: "<p>Régénère 5 PV par tour tant qu'il touche le sol. Perdre le contact avec la terre annule la régénération.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000039", creature: "Géant (Gigante)", name: "Lancer de rocher (Géant)", img: "icons/svg/hazard.svg", description: "<p>Peut lancer d'énormes rochers ou des arbres.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000040", creature: "Géant (Gigante)", name: "Jambes serpentines", img: "icons/svg/poison.svg", description: "<p>Ses jambes-serpents peuvent mordre les ennemis proches, en plus de son attaque principale.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000041", creature: "Typhon", name: "Cent têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer tous les ennemis dans un rayon de 10m simultanément.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000042", creature: "Typhon", name: "Tempête", img: "icons/svg/hazard.svg", description: "<p>Génère des ouragans et des tremblements de terre autour de lui.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000043", creature: "Lion de Némée", name: "Peau impénétrable", img: "icons/svg/holy-shield.svg", description: "<p>Immunisé aux armes tranchantes et perforantes. Seuls les dégâts contondants ou l'étranglement fonctionnent.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000044", creature: "Lion de Némée", name: "Rugissement", img: "icons/svg/terror.svg", description: "<p>Échec = effrayé pendant 1d4 tours.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000045", creature: "Lion de Némée", name: "Prédateur suprême", img: "icons/svg/eye.svg", description: "<p>Avantage aux jets de traque et de discrétion en terrain naturel.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000046", creature: "Aigle du Caucase", name: "Déchiquetage", img: "icons/svg/blood.svg", description: "<p>En combat prolongé, peut arracher des morceaux de chair (dégâts continus 1d4 par tour si la morsure initiale a touché).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000047", creature: "Aigle du Caucase", name: "Vol supérieur", img: "icons/svg/wing.svg", description: "<p>Vitesse et manœuvrabilité exceptionnelles en vol.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000048", creature: "Sanglier d'Érymanthe", name: "Charge dévastatrice", img: "icons/svg/sword.svg", description: "<p><strong>+4 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge (5m minimum). Renverse les cibles de taille humaine.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "4" }], transfer: true, effectDesc: "+4 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000049", creature: "Sanglier d'Érymanthe", name: "Défenses acérées", img: "icons/svg/sword.svg", description: "<p>Ses défenses sont capables de transpercer le bronze.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000050", creature: "Taureau de Crète", name: "Souffle de feu (Taureau)", img: "icons/svg/fire.svg", description: "<p>Peut cracher des flammes (2d6 feu, cône de 3m). Don de Poséidon.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000051", creature: "Taureau de Crète", name: "Charge du Taureau", img: "icons/svg/sword.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge directe.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000052", creature: "Stymphale", name: "Nuée", img: "icons/svg/combat.svg", description: "<p>En groupe de 5 individus ou plus, forment une nuée qui obscurcit le ciel (-2 en perception visuelle pour les ennemis).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000053", creature: "Stymphale", name: "Fiente toxique", img: "icons/svg/poison.svg", description: "<p>Poison au contact. Échec = 1d4 dégâts de poison par tour.</p>", saveAbility: "robustesse", saveDC: 12, changes: null, transfer: null, effectDesc: null }
];

function capaciteBestiaireDocData(entry) {
  const doc = {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
    type: "npcability",
    system: {
      description: entry.description,
      gmNotes: "",
      saveAbility: entry.saveAbility,
      saveDC: entry.saveDC
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  };
  if (entry.changes) {
    // Nested inline here (raw creation data for the parent Item's own "effects" array,
    // same shape as packs/*.db), NOT the dotted "system.changes" key used elsewhere in
    // this file when calling createEmbeddedDocuments() as its own separate API call.
    doc.effects.push({
      name: entry.name,
      img: entry.img,
      type: "base",
      system: { changes: entry.changes },
      disabled: false,
      transfer: entry.transfer,
      description: entry.effectDesc
    });
  }
  return doc;
}

async function applyCreateCapacitesBestiaire() {
  const pack = game.packs.get("antique.capacites-combat");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = CAPACITES_BESTIAIRE.filter(e => !existingIds.has(e.id)).map(capaciteBestiaireDocData);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

/** Embarque, sur `creature` (un Actor — document du compendium "creatures" ou copie déjà
 *  glissée dans le monde), toute capacité de CAPACITES_BESTIAIRE qui lui appartient et n'y
 *  est pas déjà, plus le retrofit Charge furieuse/Regard pétrifiant sur Minotaure/Méduse
 *  (jamais embarquées sur elles-mêmes jusqu'ici — seulement glissées sur une copie PNJ de
 *  test). Idempotent : ne recrée jamais un item déjà présent (comparaison par _id).
 */
async function embedCapacitesOnCreature(creature) {
  const existingIds = new Set(creature.items.map(i => i._id));
  const toCreate = [];

  for (const entry of CAPACITES_BESTIAIRE) {
    if (entry.creature !== creature.name || existingIds.has(entry.id)) continue;
    toCreate.push(capaciteBestiaireDocData(entry));
  }

  if (creature.name === "Minotaure" && !existingIds.has("aNca000000000001")) {
    const chargeFurieuse = await game.packs.get("antique.capacites-combat")?.getDocument("aNca000000000001");
    if (chargeFurieuse) toCreate.push(chargeFurieuse.toObject());
  }
  if (creature.name === "Méduse" && !existingIds.has("aNca000000000002")) {
    const regardPetrifiant = await game.packs.get("antique.capacites-combat")?.getDocument("aNca000000000002");
    if (regardPetrifiant) toCreate.push(regardPetrifiant.toObject());
  }

  if (!toCreate.length) return false;
  await creature.createEmbeddedDocuments("Item", toCreate, { keepId: true });
  return true;
}

async function applyEmbedCapacitesBestiaire() {
  let fixed = 0;

  const pack = game.packs.get("antique.creatures");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedCapacitesOnCreature(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    if (actor.type !== "npc") continue;
    if (await embedCapacitesOnCreature(actor)) fixed++;
  }

  return fixed;
}

/**
 * Textes de description repris depuis packs/avantages.db / packs/desavantages.db après
 * le passage de packs/_remove-effect-field.js (l'ancien contenu de system.effect). Codés
 * en dur plutôt que lus depuis doc.system.effect : Foundry construit .system depuis le
 * schéma DataModel actuel, donc dès que ce déploiement (schéma sans le champ effect) est
 * actif, une valeur déjà stockée pour un champ retiré du schéma n'est plus lisible via
 * .system — corrige le premier essai de ce correctif, qui lisait system.effect en live et
 * ne trouvait donc plus rien à recopier.
 */
const EFFECT_DESCRIPTIONS_AVANTAGES = {
  "Guerrier Aguerri": "Offre une deuxieme action de combat",
  "Sens aiguisé": "Choisir un sens qui sera aiguisé (+2 bonus perception sens)",
  "Equilibre félin": "Pas de malus sur terrain difficile",
  "Fetard": "Pas de malus du à l'alcool/ manque de sommeil",
  "Bon sens": "Une petite voix dans votre tête vous conseil parfois",
  "Sens artistique": "Vous maitrisez un art ce qui vous donne +2 en representation/ art",
  "Athléte": "Capacité de deplacement x2",
  "Sang froid": "Vous resistez à la peur +2 en volonté",
  "Commercant": "Augmente vos possibilité de commerce (vente et achat)",
  "Visage passe partout": "Votre visage n'as rien de particulier, on vous oublie facilement",
  "Peau dense": "Augmente la CA de Base de 2",
  "Vif": "Réflexe base+2",
  "Cuir de Hero": "Robustesse base+2",
  "Pisteur": "La chasse n'as pas de secret pour vous +2 vig et nature/ dans la nature",
  "Sommeil leger": "Vous dormez d'une oreille, avantage en cas de reveil soudain",
  "Faveur": "Un lambda vous dois une faveur (au choix)",
  "Colère de Zeus": "Dégats aux corps à corps +3",
  "Respect d'Héra": "Tu peux percevoir la trahison dans ton entourage",
  "Branchies de Poséidon": "Permet 1d6/lvl de régéneration avec de l'eau",
  "Protection d'Athéna": "Augmente la CA de +2",
  "Rage d'Arès": "Permet de faire deux attaques/ tour",
  "Soin d'Apollon": "Permet de stabiliser un allié 2/j",
  "Chasse d'Artèmis": "Chasse assuré",
  "Beauté d'Aphrodite": "Permet de capter l'attention ou la rejeter au combat",
  "Mains d'Hèrmès": "Permet de voler un petit objet avec 1 chance sur 6 d'etre reperer",
  "Ivresse de Dionysos": "Permet de renforcer les effets de l'alcool",
  "Chaleur d'Hestia": "Vous inspirez confiance",
  "Vue d'Hécate": "Permet de toujours connaitre la voie à prendre",
  "Don d'Hadès": "Permet de voir et de communiquer avec les morts reçents",
  "Orientation": "Vous savez toujours vous reperer dans l'espace",
  "Porte bouclier": "Vous avez un avantage lorsque vous étes le bouclier d'un autre",
  "Chrono sens": "Vous savez toujours quand vous etes",
  "Don des langues": "Polyglotte",
  "Voix enchanteresse": "Auriez vous du sang de sirène, car votre voix est hypnotique (+2 certaines comp Char)",
  "Volonté de fer": "vous n'avez peur de rien et vous etes rarement prit au dépourvu",
  "Ami des animaux": "Vous avez grandis avec des animaux ce qui augmente leurs confiance en vous",
  "Maitre d'Arme": "Vous etes un maitre du maniement d'une arme +2 si vous l'utilisez",
  "Maitre des forges": "Votre talent en forgeronerie vous permet de construire ou reparer en toute circonstance",
  "Ambidextrie": "Vos deux mains sont majeure, vous n'avez pas de faiblesse ni d'un coté ni de l'autre",
  "Faveur +": "Un membre respecté vous dois une faveur (au choix)",
  "Etincelle de Zeus": "1/4 chance de Stun 1 tour avec une arme",
  "Vision d'Héra": "1 fois par jour: permet d'avoir des Info sur une personne connu",
  "Force de Poséidon": "Augmente la CA de +1 de l'équipe (+2 si proche de la mer)",
  "Voix d'Athéna": "Peut forcer quelqu'un a obeir a un ordre 1/j",
  "Corps d'Arès": "Renforce la CA de +2",
  "Moisson de Déméter": "Permet de trouver de la nourriture (végétaux)",
  "Visée d'Apollon": "Permet d'ajouter un bonus de 2 au arme a distance",
  "Mire d'Artèmis": "Dégats à distance +3",
  "Talent d'Héphaistos": "Augmente les dégats de corps a corps +3",
  "Charme d'Aphrodite": "Réduit le jet de touche de l'adversaire de 2",
  "Pieds d'Hermes": "Augmente la distance de marche de 4 cases",
  "Talent de Dionysos": "Resistance à la drogue et l'alcool",
  "Flamme d'Hestia": "Votre corps est plus chaud que la moyenne pas de pénalité froid/humide",
  "Lanterne d'Hécate": "Permet de voir dans le noir",
  "Casque d'Hadès": "Permet de disparaitre dans les ombres 2/J",
  "Taille imposante": "Mesure dans les 2M, point de vie augmenter de 10",
  "Dieu de l'esquive": "L'esquive est un art que vous maitrisez, vous n'etes pas limité dans votre nombre d'esquive",
  "Dieu du stade": "Vos capacités athétiques sont un atout majeur, vous ne fatiguez pas si facilement",
  "Dieu de la guerre": "Si vous choisissez d'attaquer une seconde fois, aucun malus ne vous sera ajouter",
  "Rageux": "Sous l'effet de la rage, vos coups font plus mal mais vous avez tendance a voir rouge",
  "Faveur ++": "Un haut membre vous dois une faveur (au choix)",
  "Aura de Zeus": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Héra": "Renforce les jets d'Astuce de l'équipe avec +2",
  "Aura de Poséidon": "Renforce les jets de Constitution de l'équipe avec +2",
  "Aura d'Athéna": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Arès": "Renforce les jets de Force de l'équipe avec +2",
  "Aura de Demeter": "Renforce les jets de Constitution de l'équipe avec +2",
  "Aura d'Apollon": "Renforce les jets de Astuce de l'équipe avec +2",
  "Aura d'Artèmis": "Renforce les jets de Dexterité de l'équipe avec +2",
  "Aura d'Héphaïstos": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Aphrodite": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hermes": "Renforce les jets de Dextérité de l'équipe avec +2",
  "Aura de Dionysos": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hestia": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hécate": "Renforce les jets de Astuce de l'équipe avec +2",
  "Aura d'Hadès": "Renforce les jets de Constitution de l'équipe avec +2",
  "Sang de Zeus": "Extra Life",
  "Paume de Poséidon": "Offre un Bateau Magique",
  "Esprit d'Athéna": "Athéna elle même vous préviens lorsque vous faite le mauvais choix",
  "Armure d'Arès": "Frénesie apres deux kills qui double les PV temporaire",
  "Blé de Déméter": "Permet de régénerer 3 fois plus de Pv en mangeant.",
  "Oeil d'Apollon": "Oracle (vision dans le sommeil)",
  "Compagnon d'Artèmis": "Animal magique",
  "Yeux d'Héphaistos": "Permet de détécter la magie et les enchantements",
  "Murmure d'Aphrodite": "Permet d'Obtenir de sombre secrets sur une personne connus",
  "Message d'Hermes": "Permet de transmettre des messages court et simple à des alliés",
  "Amphore de Dionysos": "Permet de récuperer tout ces PV avec de l'alcool/ 1j",
  "Bucher d'Héstia": "Permet de creer un feu qui apporte protection et comfort",
  "Lune d'Hécate": "Permet un rituel par nuit",
  "Peau d'Hadès": "Multiplie les PV par deux"
};

const EFFECT_DESCRIPTIONS_DESAVANTAGES = {
  "Sens défaïllant": "Choisir un sens qui sera défaïllant (-2 bonus perception sens)",
  "Frêle": "Robustesse de base -1",
  "Distrait": "Vous avez un désavantage en vigilance -2",
  "Dépressif": "Volonté de base -1",
  "Maladroit": "Reflexe de base -1"
};

/**
 * Dédoublonne (garde le premier, supprime le reste) et reprend la description attendue
 * (EFFECT_DESCRIPTIONS_AVANTAGES/DESAVANTAGES ci-dessus) dans l'effet conservé, s'il n'en
 * a pas déjà une. N'ajoute jamais d'effet à un document qui n'en a aucun (Mule, Cuisine de
 * Déméter, Connaissance d'Héphaistos, la plupart des désavantages) — la tooltip retombe
 * sur la description complète dans ce cas (actor-sheet.mjs, _prepareTraitItems).
 */
async function cleanupEffectField(doc, descriptions) {
  if (doc.effects.size === 0) return false;

  let changed = false;

  if (doc.effects.size > 1) {
    const [, ...extraIds] = Array.from(doc.effects.keys());
    await doc.deleteEmbeddedDocuments("ActiveEffect", extraIds);
    changed = true;
  }

  const kept = doc.effects.contents[0];
  const expected = descriptions[cleanName(doc.name)];
  if (expected && kept.description !== expected) {
    await kept.update({ description: expected });
    changed = true;
  }

  return changed;
}

async function applyCleanupEffectFieldForPack(packName, itemType, descriptions) {
  let fixed = 0;

  const pack = game.packs.get(`antique.${packName}`);
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await cleanupEffectField(doc, descriptions)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== itemType) continue;
      if (await cleanupEffectField(item, descriptions)) fixed++;
    }
  }

  return fixed;
}

async function applyCleanupEffectFieldAvantages() {
  return applyCleanupEffectFieldForPack("avantages", "advantage", EFFECT_DESCRIPTIONS_AVANTAGES);
}

async function applyCleanupEffectFieldDesavantages() {
  return applyCleanupEffectFieldForPack("desavantages", "disadvantage", EFFECT_DESCRIPTIONS_DESAVANTAGES);
}

/** Voir packs/_build-effet-mule.js, dont ces données/fonctions reprennent la logique. */
const MULE_EFFET_ID = "eEft000000000079";
const MULE_CHANGES = [{ key: "system.capacitePort", type: "multiply", value: "2" }];
const MULE_EFFET_DESCRIPTION = "<p>Multiplie la capacité de port par deux, tant que cet effet est actif.</p>";

async function applyCreateEffetMule() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === MULE_EFFET_ID)) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: MULE_EFFET_ID,
    name: "Mule",
    img: "icons/svg/upgrade.svg",
    type: "base",
    system: { changes: MULE_CHANGES },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: MULE_EFFET_DESCRIPTION,
    transfer: true
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

async function embedMuleEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${MULE_EFFET_ID}]{Mule}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Mule",
      img: doc.img,
      "system.changes": MULE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyEmbedEffetMule() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Mule") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedMuleEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Mule") continue;
      if (await embedMuleEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_add-item-weights.js, dont ces données/fonctions reprennent la logique. */
const WEAPON_WEIGHTS = {
  "Couteau": 0.3, "Dague": 0.5, "Glaive": 1.2, "Épée courte": 1.3, "Lance": 2.5,
  "Hache": 1.8, "Javeline": 1.0, "Hache de lancer": 0.9, "Bolas": 0.7,
  "Bouclier de lancer": 1.5, "Filet": 1.5, "Couteau de lancer": 0.3, "Chakram": 0.6,
  "Serpe": 1.0, "Bâton": 1.5, "Gourdin": 1.2, "Marteau": 2.0, "Trident": 2.5,
  "Cimeterre": 1.4, "Double hache": 3.0, "Marteau de guerre": 3.5, "Sarisse": 4.5,
  "Arc court": 1.0, "Arc long": 1.5, "Fronde": 0.2, "Fouet": 0.5
};

const ARMOR_WEIGHTS = {
  "Vêtement en Lin": 0.5, "Armure de cuir": 6, "Armure de cuir cloutée": 8,
  "Armure en peau": 5, "Armure de cuivre": 12, "Armure en plaque": 20, "Maille": 11,
  "Cuirasse": 9, "Bouclier de bois": 3, "Bouclier en cuir": 3.5, "Bouclier cuivre": 6,
  "Bouclier renforcé": 7
};

const EQUIPEMENT_WEIGHTS = {
  "Linothorax": 4, "Thorax de cuir": 6, "Cuirasse de bronze": 9,
  "Armure d'hoplite complète": 22, "Casque corinthien": 1.2, "Casque chalcidien": 1,
  "Cnémides de bronze": 1.5, "Aspis (bouclier rond)": 7, "Peltè (bouclier léger)": 3,
  "Potion de soin": 0.3, "Potion de soin majeure": 0.4, "Nectar des dieux": 0.3,
  "Ambroisie": 0.2, "Élixir de Force d'Héraclès": 0.3, "Huile de sagesse d'Athéna": 0.3,
  "Philtre d'amour d'Aphrodite": 0.2, "Vin de Dionysos": 1.0, "Onguent d'Asclépios": 0.2,
  "Eau du Styx": 0.3, "Larmes de Niobé": 0.1, "Sang de Méduse": 0.2,
  "Poudre de sommeil d'Hypnos": 0.1, "Antidote universel": 0.3,
  "Corde de chanvre (30m)": 3, "Torche": 0.5, "Rations de voyage": 1.0,
  "Sacoche de guérisseur": 2.0, "Outils d'artisan": 3.0, "Outre à eau (2L)": 2.0,
  "Tente de campagne": 8.0, "Breuvage du Colosse": 0.3, "Essence d'Acrobate": 0.2,
  "Philtre de l'Ours": 0.3, "Liqueur du Vent": 0.3, "Elixir de l'Orateur": 0.3,
  "Breuvage de l'Astre": 0.3, "Antidote Commun": 0.3, "Potion Simple": 0.3,
  "Onguent de cicatrisation": 0.2, "Antidouleur": 0.2, "Onguent anti infection": 0.2,
  "Tisane de langueur": 0.3, "Thé d'Asclépsios": 0.3, "Essence du Brisé": 0.2,
  "Elixir du Frêle": 0.2, "Breuvage de la Tortue": 0.3, "Sève du Boiteux": 0.2,
  "Sirop de Frêne": 0.2, "Morsure du Serpent": 0.2, "Plaie Ouverte": 0.2,
  "Rations régénératrices de Déméter": 0.5
};

function baseWeaponName(name) {
  const idx = name.indexOf(" (");
  return idx === -1 ? name : name.slice(0, idx);
}

async function setItemWeight(doc, weightTable, lookupKey) {
  const weight = weightTable[lookupKey];
  if (weight === undefined || doc.system.poids === weight) return false;
  await doc.update({ "system.poids": weight });
  return true;
}

async function applyItemWeightsArmes() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type === "Item") continue;
      const doc = await pack.getDocument(indexEntry._id);
      const table = doc.type === "weapon" ? WEAPON_WEIGHTS : ARMOR_WEIGHTS;
      const key = doc.type === "weapon" ? baseWeaponName(doc.name) : doc.name;
      if (await setItemWeight(doc, table, key)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "weapon" && item.type !== "equipment") continue;
      const table = item.type === "weapon" ? WEAPON_WEIGHTS : ARMOR_WEIGHTS;
      const key = item.type === "weapon" ? baseWeaponName(item.name) : item.name;
      if (key in table && (await setItemWeight(item, table, key))) fixed++;
    }
  }

  return fixed;
}

/**
 * Real category key (module/helpers/config.mjs ANTIQUE.weaponCategories) for every
 * weapon base name — see the "0.6.91-fix-weapon-categories" PACK_UPDATES entry.
 * No weapon has ever had system.category/categoryDistance explicitly set (neither
 * packs/_build-armes.js nor packs/_add-arbalete-munitions.js sets them for the
 * pre-Arbalète weapons), so every single one has silently been relying on the
 * schema defaults ("armeBlanche" / "armeADistance") — right by coincidence only
 * for actual "Arme blanche" weapons. Both fields are set to the same key: this
 * system has no separate "melee fallback" skill for an inherently ranged/thrown
 * weapon, so the melee-mode category may as well match the distance-mode one.
 */
const WEAPON_CATEGORIES = {
  "Couteau": "armeBlanche", "Dague": "armeBlanche", "Glaive": "armeBlanche",
  "Épée courte": "armeBlanche", "Lance": "armeBlanche", "Hache": "armeBlanche",
  "Javeline": "armeDeJet", "Hache de lancer": "armeDeJet", "Bolas": "armeDeJet",
  "Bouclier de lancer": "armeDeJet", "Filet": "armeDeJet", "Couteau de lancer": "armeDeJet",
  "Chakram": "armeDeJet",
  "Serpe": "armeExotique", "Bâton": "armeExotique", "Gourdin": "armeExotique",
  "Marteau": "armeExotique", "Trident": "armeExotique", "Cimeterre": "armeExotique",
  "Double hache": "combatDeuxMains", "Marteau de guerre": "combatDeuxMains", "Sarisse": "combatDeuxMains",
  "Arc court": "armeADistance", "Arc long": "armeADistance", "Fronde": "armeADistance",
  "Fouet": "armeADistance", "Arbalète": "armeADistance"
};

async function setWeaponCategory(doc) {
  const key = WEAPON_CATEGORIES[baseWeaponName(doc.name)];
  if (!key || (doc.system.category === key && doc.system.categoryDistance === key)) return false;
  await doc.update({ "system.category": key, "system.categoryDistance": key });
  return true;
}

async function applyFixWeaponCategories() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type !== "weapon") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setWeaponCategory(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "weapon") continue;
      if (await setWeaponCategory(item)) fixed++;
    }
  }

  return fixed;
}

/** Same 3 Arbalète tiers + Munition folder + 3 munition items as
 *  packs/_add-arbalete-munitions.js, same ids (keepId) — kept in sync by hand,
 *  see that script's header comment for why this isn't generated from shared data. */
const ARME_A_DISTANCE_FOLDER_ID = "fArm000000000005";

function arbaleteDocData(id, name, damage, critical, price) {
  return {
    _id: id, name, type: "weapon", img: "icons/svg/target.svg",
    system: {
      attBonus: 0, attBonusDistance: 0, category: "armeADistance", categoryDistance: "armeADistance",
      damage, critical, typeDamage: "Perçant", portee: 24, hasPortee: true, consumable: true,
      linkedAmmoId: "", slot: "", equipped: false, price: `${price} po`, poids: 2,
      description: [
        "<p><strong>Catégorie :</strong> Arme à distance</p>",
        `<p><strong>Qualité :</strong> ${name.match(/\((.+)\)/)[1]}</p>`,
        `<p><strong>Prix :</strong> ${price} po</p>`
      ].join("\n"),
      gmNotes: ""
    },
    effects: [], folder: ARME_A_DISTANCE_FOLDER_ID, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

const MUNITION_FOLDER_ID = "fArm000000000120";
const MUNITION_ITEMS = [
  { id: "aEqp000000000121", name: "Flèches", price: 0.1, poids: 0.02, img: "icons/weapons/ammunition/arrows-fletching.webp" },
  { id: "aEqp000000000122", name: "Carreaux d'arbalète", price: 0.2, poids: 0.05, img: "icons/weapons/crossbows/crossbow-golden-bolt.webp" },
  { id: "aEqp000000000123", name: "Pierres de fronde", price: 0.02, poids: 0.05, img: "icons/commodities/stone/stone-chunk-grey-white.webp" }
];

function munitionDocData(entry) {
  return {
    _id: entry.id, name: entry.name, type: "equipment", img: entry.img,
    system: {
      // Must be true: this is what makes the item selectable as "linked ammo" on a
      // weapon's sheet (context.ammoOptions) and the Combat tab's quick-select
      // (context.ammoCandidates) — both filter on system.consumable.
      quantity: 1, consumable: true, caBonus: 0, healAmount: 0, linkedSkill: "", skillBonus: 0,
      slot: "", equipped: false, price: `${entry.price} po`, poids: entry.poids,
      apothCategory: "", apothType: "", isIngredientBag: false,
      description: `<p><strong>Prix :</strong> ${entry.price} po</p>`, gmNotes: ""
    },
    effects: [], folder: MUNITION_FOLDER_ID, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

async function applyCreateArbaleteMunitions() {
  const pack = game.packs.get("antique.armes");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  let created = 0;

  await pack.configure({ locked: false });

  const missingWeapons = [
    arbaleteDocData("aWpn000000000117", "Arbalète (Simple facture)", "1d8", "x2", 12),
    arbaleteDocData("aWpn000000000118", "Arbalète (Moyenne facture)", "1d8+2", "x2", 28),
    arbaleteDocData("aWpn000000000119", "Arbalète (Bonne facture)", "1d10+2", "19/x2", 40)
  ].filter(d => !existingIds.has(d._id));
  if (missingWeapons.length) {
    await pack.documentClass.createDocuments(missingWeapons, { pack: pack.collection, keepId: true });
    created += missingWeapons.length;
  }

  if (!existingIds.has(MUNITION_FOLDER_ID)) {
    await Folder.create({
      _id: MUNITION_FOLDER_ID, name: "Munition", type: "Item", sort: 700000, sorting: "a",
      color: "#8B0000", folder: null
    }, { pack: pack.collection, keepId: true });
    created++;
  }

  const missingMunitions = MUNITION_ITEMS.map(munitionDocData).filter(d => !existingIds.has(d._id));
  if (missingMunitions.length) {
    await pack.documentClass.createDocuments(missingMunitions, { pack: pack.collection, keepId: true });
    created += missingMunitions.length;
  }

  await pack.configure({ locked: true });
  return created;
}

const MUNITION_NAMES = new Set(MUNITION_ITEMS.map(m => m.name));

/** Fixes system.consumable, wrongly false when the munitions were first created (see
 *  "0.6.91-create-arbalete-munitions" above) — without it, a munition never appears in
 *  a weapon's "Munition liée" dropdown (context.ammoOptions/ammoCandidates both filter
 *  on this flag). Actor-owned copies are matched by name, not id: a compendium drop
 *  (browser-shared.mjs's grantItemToActor) creates the embedded copy with a fresh
 *  random id, not the compendium's own. */
async function applyFixMunitionConsumable() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    for (const entry of MUNITION_ITEMS) {
      const doc = await pack.getDocument(entry.id);
      if (doc && !doc.system.consumable) {
        await doc.update({ "system.consumable": true });
        fixed++;
      }
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "equipment" || !MUNITION_NAMES.has(item.name) || item.system.consumable) continue;
      await item.update({ "system.consumable": true });
      fixed++;
    }
  }

  return fixed;
}

/** Same document as packs/_add-fleche-empoisonnee.js, same id (keepId). */
async function applyCreateFlecheEmpoisonnee() {
  const pack = game.packs.get("antique.armes");
  if (!pack) return 0;

  const id = "aEqp000000000124";
  const existing = await pack.getDocument(id);
  if (existing) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: id, name: "Flèches empoisonnées", type: "equipment",
    img: "icons/weapons/ammunition/arrow-broadhead-green.webp",
    system: {
      quantity: 1, consumable: true, caBonus: 0, healAmount: 0, linkedSkill: "", skillBonus: 0,
      slot: "", equipped: false, price: "3 po", poids: 0.02,
      apothCategory: "", apothType: "", isIngredientBag: false,
      description: "<p>Une flèche dont la pointe a été trempée dans un poison de contact.</p>",
      gmNotes: "<p>Effet du poison à définir par le MJ (dégâts et/ou jet de sauvegarde " +
        "Robustesse) — non automatisé, à appliquer manuellement quand le tir touche.</p>"
    },
    effects: [], folder: "fArm000000000120", sort: 0, ownership: { default: 0 }, flags: {}
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

/** Same 7 documents as packs/_build-tresors.js, same ids (keepId). */
const TRESORS = [
  { id: "aTrs000000000001", name: "Bijou orné", img: "icons/commodities/treasure/brooch-jewel-gold-blue.webp",
    price: "25 po", poids: 0.1,
    description: "<p>Une broche en or sertie d'une pierre bleue, travail délicat digne d'un atelier de cité.</p>", gmNotes: "" },
  { id: "aTrs000000000002", name: "Parchemin scellé", img: "icons/sundries/scrolls/scroll-bound-brown-tan.webp",
    price: "5 po", poids: 0.1,
    description: "<p>Un rouleau de parchemin fermé par un cordon, son contenu inconnu tant qu'il n'est pas ouvert.</p>",
    gmNotes: "<p>À définir par le MJ selon l'intrigue : une carte, un contrat, une prophétie...</p>" },
  { id: "aTrs000000000003", name: "Lettre cachetée", img: "icons/sundries/documents/document-letter-tan.webp",
    price: "0 po", poids: 0.05,
    description: "<p>Une lettre pliée, cachetée à la cire d'un sceau qu'on ne reconnaît pas.</p>",
    gmNotes: "<p>Auteur et contenu à définir par le MJ — un indice, un message codé, une correspondance privée.</p>" },
  { id: "aTrs000000000004", name: "Statuette à l'effigie d'un dieu", img: "icons/commodities/treasure/figurine-idol.webp",
    price: "15 po", poids: 0.5,
    description: "<p>Une petite statuette de marbre représentant une divinité de l'Olympe, offrande votive ou objet de culte domestique.</p>", gmNotes: "" },
  { id: "aTrs000000000005", name: "Flacon de parfum", img: "icons/consumables/potions/potion-vial-corked-labeled-purple.webp",
    price: "8 po", poids: 0.1,
    description: "<p>Un petit flacon de verre soufflé contenant une essence parfumée, importée de loin.</p>", gmNotes: "" },
  { id: "aTrs000000000006", name: "Pierre précieuse", img: "icons/commodities/gems/gem-faceted-diamond-blue.webp",
    price: "50 po", poids: 0.05,
    description: "<p>Une gemme taillée, dont la valeur dépend de sa pureté et de sa couleur.</p>", gmNotes: "" },
  { id: "aTrs000000000007", name: "Caillou", img: "icons/commodities/stone/stone-chunk-brown.webp",
    price: "0 po", poids: 0.05,
    description: "<p>Un simple caillou. Sans valeur marchande, sauf circonstance particulière.</p>",
    gmNotes: "<p>Objet narratif par défaut : à réserver aux cas où un \"trésor\" n'en est pas vraiment un.</p>" }
];

function tresorDocData(entry) {
  return {
    _id: entry.id, name: entry.name, type: "treasure", img: entry.img,
    system: { quantity: 1, price: entry.price, poids: entry.poids, description: entry.description, gmNotes: entry.gmNotes },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

async function applyCreateTresors() {
  const pack = game.packs.get("antique.tresors");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = TRESORS.filter(e => !existingIds.has(e.id)).map(tresorDocData);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function applyItemWeightsEquipement() {
  let fixed = 0;

  const pack = game.packs.get("antique.equipement");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await setItemWeight(doc, EQUIPEMENT_WEIGHTS, doc.name)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "equipment" || !(item.name in EQUIPEMENT_WEIGHTS)) continue;
      if (await setItemWeight(item, EQUIPEMENT_WEIGHTS, item.name)) fixed++;
    }
  }

  return fixed;
}

const EFFETS_DESAVANTAGES = [
  { id: "eEft000000000080", name: "Phobie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Petite peur qui offre un malus de -1 si echec de volonté</p>" },
  { id: "eEft000000000081", name: "Dépendance légal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dépendance, vous devez vous y adonnez 1/2j sinon malus de -1/j</p>" },
  { id: "eEft000000000082", name: "Marmotte", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez besoin de dormir plus que les autres, un sommeil court n'est qu'a moitie efficace</p>" },
  { id: "eEft000000000083", name: "Cauchemards", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous faites des cauchemards, dormir vous fait peur. 1/3 chance de mauvais repos</p>" },
  { id: "eEft000000000084", name: "Coeur sensible", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous ne pouvez laisser une personne plus faibre souffrir</p>" },
  { id: "eEft000000000085", name: "Sosie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Quelqu'un qui vous ressemblent à tendance à vous attiré des ennuis</p>" },
  { id: "eEft000000000086", name: "Dette", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un lambda (au choix)</p>" },
  { id: "eEft000000000087", name: "Petite nature", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.resistancePoisons.bonus","type":"add","value":"-2"}], description: "<p>Vous etes plus sensible que le commun des mortels au froid, poison</p>" },
  { id: "eEft000000000088", name: "Enfant", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.commandement.bonus","type":"add","value":"-2"}], description: "<p>On ne vous prend pas au sérieux au vue de votre jeune age -2 dans certaines comp de Char</p>" },
  { id: "eEft000000000089", name: "Superstitieux", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes supertsitieux, ne pas vous proteger vous donne un malus de -1</p>" },
  { id: "eEft000000000090", name: "Introverti", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.baratin.bonus","type":"add","value":"-2"}], description: "<p>Lorsqu'il y a plus de 3 inconnus votre voix se perd -2 comp Char</p>" },
  { id: "eEft000000000091", name: "Sinistre", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous n'avez pas l'air net (Baptiste?), on vous fais plus difficilement confiance</p>" },
  { id: "eEft000000000092", name: "Moquerie de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Votre confiance en vous et votre sang froid sont mis à rudes épreuves lorsque l'on se moque de vous</p>" },
  { id: "eEft000000000093", name: "Paranoïa d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Vous ne supportez pas que l'on parle sur vous, dans votre dos, et pourtant ça arrive sans cesse</p>" },
  { id: "eEft000000000094", name: "Tempête de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Vous avez le mal de mer, ce qui est embettant pour un grec</p>" },
  { id: "eEft000000000095", name: "Chouette d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous etes obnubilé par une vision de chouette en or que vous auriez vu, et que vous voyez encor</p>" },
  { id: "eEft000000000096", name: "Poigne d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vos membres s'endoloris apres chaque actions, +1 diff pour deuxieme attaque</p>" },
  { id: "eEft000000000097", name: "Carence de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez plus faim que la moyenne, vous devez plus manger et boire</p>" },
  { id: "eEft000000000098", name: "Arc d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous semblez rendre les arcs inefficaces lorsque vous les touchés, les cordes laches, le bois craque</p>" },
  { id: "eEft000000000099", name: "Proie d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Les animaux sauvages ont une forte tendance à vous charger et/ ou à vous sentir de loin</p>" },
  { id: "eEft000000000100", name: "Confiance d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Les forgerons ne vous font pas confiance, les tarifs sont plus cher pour vous</p>" },
  { id: "eEft000000000101", name: "Outrage d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Votre physique derange, vous n'étes pas moches mais pas attirants</p>" },
  { id: "eEft000000000102", name: "Geste d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Votre bourse a tendance à perdre quelques pieces</p>" },
  { id: "eEft000000000103", name: "Coupe de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous ne supportez pas l'alcool, vous avez l'alcool mauvais ou triste ça dépend</p>" },
  { id: "eEft000000000104", name: "Destin d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>On vous prend difficilement au serieux, vous faites presque trop figuration.</p>" },
  { id: "eEft000000000105", name: "Perte d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Votre sens de l'orientation vous joue des tours</p>" },
  { id: "eEft000000000106", name: "Horde d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Les morts vous pourchassent et chuchotent en permanences</p>" },
  { id: "eEft000000000107", name: "Gravement malade", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une maladie chronique qui peux venir et partir</p>" },
  { id: "eEft000000000108", name: "Hostilité animal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Les animaux ne vous font pas confiance</p>" },
  { id: "eEft000000000109", name: "Phobie majeur", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une peur handicapante qui vous donne un malus de -2 si echec volonté</p>" },
  { id: "eEft000000000110", name: "Loi d'Atrée", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes contraint de suivre la Loi d'Atrée, sur les liens qui unissent les voyageurs</p>" },
  { id: "eEft000000000111", name: "Dette +", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un membre respecté (au choix)</p>" },
  { id: "eEft000000000112", name: "Hanté", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Quelques chose vous suit, un ancetre peut être, et à tendance à jouer avec vos nerfs</p>" },
  { id: "eEft000000000113", name: "Culpabilité écrasante", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous vous en voulez facilement et vous devez vous racheter (Obole...)</p>" },
  { id: "eEft000000000114", name: "Amnésie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous ne vous souvenez pas qui vous êtes mais votre passé pourrais revenir d'une façon ou d'une autre</p>" },
  { id: "eEft000000000115", name: "Blessure permanente", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Un de vos membres vous fait mal au vu d'une ancienne blessure (Avant j'étais aventurier)</p>" },
  { id: "eEft000000000116", name: "Impétueux", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez un caractere violent et impulsif</p>" },
  { id: "eEft000000000117", name: "Amoureux transit", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Votre moitié vous manque, vous n'avez d'yeux que pour elle.</p>" },
  { id: "eEft000000000118", name: "Présence de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Vous avez une peur phobique de l'orage -Kéraunophobie-</p>" },
  { id: "eEft000000000119", name: "Présence d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Vous avez une peur phobique des oiseaux -Ornitophobie-</p>" },
  { id: "eEft000000000120", name: "Présence de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Vous avez une peur phobique de l'eau -Aquaphobie-</p>" },
  { id: "eEft000000000121", name: "Présence d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous avez une peur phobique de l'échec -atichiphobie-</p>" },
  { id: "eEft000000000122", name: "Présence d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vous avez une peur phobique du sang -Hématophobie-</p>" },
  { id: "eEft000000000123", name: "Présence de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez une peur phobique des fruits -Carpophobie-</p>" },
  { id: "eEft000000000124", name: "Présence d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous avez une peur de prendre la parole en public -Glossophobie-</p>" },
  { id: "eEft000000000125", name: "Présence d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Vous avez une peur phobique des forets -Hylophobie-</p>" },
  { id: "eEft000000000126", name: "Présence d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Vous avez une peur phobique de la foule -Agoraphobie-</p>" },
  { id: "eEft000000000127", name: "Présence d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Vous avez une peur phobique de la solitude -Autophobie-</p>" },
  { id: "eEft000000000128", name: "Présence d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Vous avez une peur phobique des espaces confinés -Claustrophobie-</p>" },
  { id: "eEft000000000129", name: "Présence de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous avez une peur phobique des enfants -Pédophobie-</p>" },
  { id: "eEft000000000130", name: "Présence d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>Vous avez une peur phobique du feu -Pyrophobie-</p>" },
  { id: "eEft000000000131", name: "Présence d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous avez une peur phobique de l'obscurité -Kénophobie-</p>" },
  { id: "eEft000000000132", name: "Présence d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Vous avez une peur de la mort -Thanatophobie-</p>" },
  { id: "eEft000000000133", name: "Dépendance illégal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dépendance illégale, vous devez vous y adonnez 1/2j sinon malus de -1/j</p>" },
  { id: "eEft000000000134", name: "Tache de naissance", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Une marque sur votre corps relativement visible qui vous rend sujet a des critiques, des messes basses</p>" },
  { id: "eEft000000000135", name: "Némésis", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous vous étes fait un énemi d'une personne qui vous est supérieur</p>" },
  { id: "eEft000000000136", name: "Recherché", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Votre tête est mise à prix dans diverses cités de la Gréces</p>" },
  { id: "eEft000000000137", name: "Chat Noir", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous jouer de malchance, si un événement facheux se produit, il y a fort à parier que ce soit pour vous</p>" },
  { id: "eEft000000000138", name: "Zélé", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes un croyant fanatique, seule la voix de votre dieu compte, les autres ne sont rien</p>" },
  { id: "eEft000000000139", name: "Dette ++", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un haut membre (au choix)</p>" },
  { id: "eEft000000000140", name: "Syndrome de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Vous avez une forte tendance à vouloir tout contrôler, à prendre le leadership</p>" },
  { id: "eEft000000000141", name: "Jugement d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>La malchance vous poursuit, parfois vous devrez retenter vos jets</p>" },
  { id: "eEft000000000142", name: "Maladie de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Les chevaux n'ont pas confiance en vous, ils sont tendus en votre presence</p>" },
  { id: "eEft000000000143", name: "Sens d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous avez tendance a ne pas faire le bon choix. Vous reflechissez longtemps aux choix</p>" },
  { id: "eEft000000000144", name: "Serment d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vos serments vous lie, Arès y veille</p>" },
  { id: "eEft000000000145", name: "Pollen de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez des allergies à plusieurs plantes.</p>" },
  { id: "eEft000000000146", name: "Diagnostique d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Les soins sont parfois moins efficaces sur vous.</p>" },
  { id: "eEft000000000147", name: "Marche d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Vous vous deplacer comme un boeuf, il vous faut beaucoup d'adresse pour ne pas faire de bruit</p>" },
  { id: "eEft000000000148", name: "Defaut d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Vous armes s'émoussent plus rapidement que la moyenne</p>" },
  { id: "eEft000000000149", name: "Ragot d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Votre réputation vous precede, enfin une mauvaise réputation</p>" },
  { id: "eEft000000000150", name: "Lubie d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Parfois des petits malins s'amuse à mettre des affiches de recherche avec votre tête dessus</p>" },
  { id: "eEft000000000151", name: "Insertion de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous avez un vice, klépto? Parano? Nympho?</p>" },
  { id: "eEft000000000152", name: "Honte d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>En votre presence, les feux se font moins chaleureux, plus sombre, moins réconfortant</p>" },
  { id: "eEft000000000153", name: "Marque d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous etes un la cible de sortileges</p>" },
  { id: "eEft000000000154", name: "Prix d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>L'argent et l'or vous brûle les doigts, littéralement</p>" },
  { id: "eEft000000000155", name: "Danse de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Les Curêtes de Zeus suivent vos pas, le moindre éclair peut être le signe de leur arriver</p>" },
  { id: "eEft000000000156", name: "Jalousie d'Hera", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Aucun doute, Héra à lacher Argos, le géant aux 100 yeux a vos trousses, vous sentez toujours son regard</p>" },
  { id: "eEft000000000157", name: "Lignée de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Un oeil unique qui luit dans la nuit, l'odeur du mouton, pas de doute un cyclope vous traque</p>" },
  { id: "eEft000000000158", name: "Défi d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Gare aux descendants d'Arachné, si elle vous voient vous serez leurs proies</p>" },
  { id: "eEft000000000159", name: "Fureur d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vous etes habité par une Makhaï, un esprit du combat</p>" },
  { id: "eEft000000000160", name: "Tristesse de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous semblez attirer la famine, si vous rester trop longtemps dans une ville sans demander pardon</p>" },
  { id: "eEft000000000161", name: "Maux d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous semblez attirer la peste, si vous rester trop longtemps dans une ville.</p>" },
  { id: "eEft000000000162", name: "Chatiment d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Des chasseresses Dryades vous pourchassent sans repos</p>" },
  { id: "eEft000000000163", name: "Poursuite d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Un automate d'Héphaïstos vous poursuit, mais il peut ressembler a n'importe qui!</p>" },
  { id: "eEft000000000164", name: "Déni d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Vous avez un amour impossible, veritable creve coeur</p>" },
  { id: "eEft000000000165", name: "Bande d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>C'est vraiment pas de chance, vous semblez tomber continuellement sur des voleurs et bandits</p>" },
  { id: "eEft000000000166", name: "Folie de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous etes pourchassé par une Ménade, esprit de la folie, vous la sentez s'insinuer parfois, ou, toujours</p>" },
  { id: "eEft000000000167", name: "Déception d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>Votre propre famille vous à renier, certains même vous pourchasse, mais pourquoi?</p>" },
  { id: "eEft000000000168", name: "Terreur d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous etes la proie d'une Empousa, sa jambe d'Ane et d'Or resonnent derriere vous.</p>" },
  { id: "eEft000000000169", name: "Jugement d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Les Erinyes vous pourchassent! Elles sont partout, tout le temps!</p>" }
];

function effetDocDataDesavantage(entry) {
  return {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
    type: "base",
    system: { changes: entry.changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsDesavantages() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_DESAVANTAGES.filter(e => !existingIds.has(e.id)).map(effetDocDataDesavantage);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndEmbedDesavantage(doc, entry) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${entry.id}]{${entry.name}}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: entry.name,
      img: entry.img,
      "system.changes": entry.changes,
      description: entry.description,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  } else {
    const kept = doc.effects.contents[0];
    if (kept.description !== entry.description) {
      await kept.update({ description: entry.description });
      changed = true;
    }
  }

  return changed;
}

async function applyEmbedEffetsDesavantages() {
  const byName = new Map(EFFETS_DESAVANTAGES.map(e => [e.name, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.desavantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndEmbedDesavantage(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "disadvantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndEmbedDesavantage(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Reverts the short-lived "Lancer le dé" button + informational Effets-tab entry for
 *  Assistance/Malédiction (tried, then rejected by the user — they want either a real
 *  applicable effect or pure narrative, not a die-roll gimmick) back to plain narrative
 *  text, on whichever copies already picked up either of the two now-removed correctifs. */
const SPELL_NARRATIVE_REVERT = {
  "Assistance": {
    id: "eSrt000000000009",
    description: "<p>Permet à un allié de jeter un d4 supplémentaire lors de l'action de son choix.</p>"
  },
  "Malédiction": {
    id: "eSrt000000000010",
    description: "<p>Force un malus d'un d6 à la cible de son choix.</p>"
  }
};

async function revertSpellToNarrative(doc) {
  const cfg = SPELL_NARRATIVE_REVERT[doc.name];
  if (!cfg) return false;

  let changed = false;
  const effect = doc.effects.get(cfg.id);
  if (effect) {
    await effect.delete();
    changed = true;
  }
  if (doc.system.description !== cfg.description || doc.system.rollFormula) {
    await doc.update({ "system.description": cfg.description, "system.-=rollFormula": null, "system.-=rollLabel": null });
    changed = true;
  }
  return changed;
}

async function applyRevertSpellsToNarrative() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await revertSpellToNarrative(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await revertSpellToNarrative(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await revertSpellToNarrative(item)) fixed++;
      }
    }
  }

  return fixed;
}

/** Same 2 entries as the direct edit to packs/effets.db — kept in sync by hand. Standalone
 *  Effet documents (no advantage/cost attached, per the user's choice) — the GM grants one
 *  manually (drag & drop onto a character sheet) to permanently raise system.pointsChance,
 *  a plain counter (see actor-character.mjs) never touched by prepareDerivedData(), so a
 *  straightforward ADD in the default "initial" phase is enough (same reasoning as the
 *  Auras targeting system.abilities.*.value — no cascade dependency to worry about). */
const POINTS_CHANCE_EFFETS = [
  {
    id: "eEft000000000172",
    name: "Point de Chance +1",
    changes: [{ key: "system.pointsChance", type: "add", value: "1" }],
    description: "<p>+1 Point de Chance, de façon permanente.</p><p>Octroyé manuellement par le MJ (glisser-déposer sur la fiche).</p>"
  },
  {
    id: "eEft000000000173",
    name: "Point de Chance +2",
    changes: [{ key: "system.pointsChance", type: "add", value: "2" }],
    description: "<p>+2 Points de Chance, de façon permanente.</p><p>Octroyé manuellement par le MJ (glisser-déposer sur la fiche).</p>"
  }
];

function effetDocDataPointsChance(entry) {
  return {
    _id: entry.id,
    name: entry.name,
    img: "icons/svg/upgrade.svg",
    type: "base",
    system: { changes: entry.changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsPointsChance() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = POINTS_CHANCE_EFFETS.filter(e => !existingIds.has(e.id)).map(effetDocDataPointsChance);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

/** Same 2 spells/effects as the direct edit to packs/sorts.db — kept in sync by hand. */
const SPELL_EFFECTS = {
  "Bénédiction des Titans": {
    id: "eSrt000000000001",
    changes: [{ key: "system.abilities.for.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Force (version solo)."
  },
  "Danse du Serpent": {
    id: "eSrt000000000002",
    changes: [{ key: "system.abilities.dex.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Dextérité (version solo)."
  },
  "Résilience de l'Immortel": {
    id: "eSrt000000000003",
    changes: [{ key: "system.abilities.con.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Constitution (version solo)."
  },
  "Eveil du Sage": {
    id: "eSrt000000000004",
    changes: [{ key: "system.abilities.int.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Intelligence (version solo)."
  },
  "Méditation des Ancêtres": {
    id: "eSrt000000000005",
    changes: [{ key: "system.abilities.ast.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Astuce (version solo)."
  },
  "Glamour Divin": {
    id: "eSrt000000000006",
    changes: [{ key: "system.abilities.cha.mod", mode: 2, value: "3", phase: "abilities" }],
    description: "+3 Charisme (version solo)."
  },
  "Souffle aux Pieds Legers": {
    id: "eSrt000000000007",
    changes: [{ key: "system.initiative", mode: 2, value: "4", phase: "final" }],
    description: "+4 Initiative (version solo)."
  },
  "Grâce des Astres Alignés": {
    id: "eSrt000000000008",
    // system.pointsChance is a plain counter, never recomputed — no cascade concern,
    // unlike the ability-mod spells above, so no custom "abilities" phase needed here.
    changes: [{ key: "system.pointsChance", mode: 2, value: "2" }],
    description: "+2 Points de Chance (version solo)."
  }
};

/** Spells whose bonus is CA-only — reuses the older, simpler caBonus/apply-effect
 *  mechanism (same as "Peau d'écorce") instead of an embedded effect, since a plain
 *  number is all that mechanism needs. */
const SPELL_CA_BONUS = {
  "Rage Incontrôlable": 1,
  "Peau de Fer": 2
};

async function setSpellCaBonus(doc) {
  const amount = SPELL_CA_BONUS[doc.name];
  if (amount === undefined || doc.system.caBonus === amount) return false;
  await doc.update({ "system.caBonus": amount });
  return true;
}

async function embedSpellEffect(doc) {
  const cfg = SPELL_EFFECTS[doc.name];
  if (!cfg || doc.effects.size) return false;
  await doc.createEmbeddedDocuments("ActiveEffect", [{
    _id: cfg.id, name: doc.name, img: doc.img, transfer: false, disabled: false,
    changes: cfg.changes, description: cfg.description
  }], { keepId: true });
  return true;
}

/** A weaker version of a spell's effect, meant for an ally rather than the caster —
 *  a separate embedded ActiveEffect (its own button on the chat card, see item.mjs)
 *  so any player can self-serve applying it to their own token. Flagged
 *  "spellScope": "group" purely for the chat card to pick the right button label. */
const SPELL_GROUP_EFFECTS = {
  "Bénédiction des Titans": {
    id: "eSrtG00000000001",
    changes: [{ key: "system.abilities.for.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Force (version groupe)."
  },
  "Danse du Serpent": {
    id: "eSrtG00000000002",
    changes: [{ key: "system.abilities.dex.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Dextérité (version groupe)."
  },
  "Eveil du Sage": {
    id: "eSrtG00000000003",
    changes: [{ key: "system.abilities.int.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Intelligence (version groupe)."
  },
  "Résilience de l'Immortel": {
    id: "eSrtG00000000004",
    changes: [{ key: "system.abilities.con.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Constitution (version groupe)."
  },
  "Méditation des Ancêtres": {
    id: "eSrtG00000000005",
    changes: [{ key: "system.abilities.ast.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Astuce (version groupe)."
  },
  "Glamour Divin": {
    id: "eSrtG00000000006",
    changes: [{ key: "system.abilities.cha.mod", mode: 2, value: "1", phase: "abilities" }],
    description: "+1 Charisme (version groupe)."
  },
  "Souffle aux Pieds Legers": {
    id: "eSrtG00000000007",
    changes: [{ key: "system.initiative", mode: 2, value: "2", phase: "final" }],
    description: "+2 Initiative (version groupe)."
  },
  "Grâce des Astres Alignés": {
    id: "eSrtG00000000008",
    changes: [{ key: "system.pointsChance", mode: 2, value: "1" }],
    description: "+1 Point de Chance (version groupe)."
  }
};

async function embedSpellGroupEffect(doc) {
  const cfg = SPELL_GROUP_EFFECTS[doc.name];
  if (!cfg || doc.effects.get(cfg.id)) return false;
  await doc.createEmbeddedDocuments("ActiveEffect", [{
    _id: cfg.id, name: `${doc.name} (Groupe)`, img: doc.img, transfer: false, disabled: false,
    changes: cfg.changes, description: cfg.description,
    flags: { antique: { spellScope: "group" } }
  }], { keepId: true });
  return true;
}

/**
 * `system.abilities.*.mod` and `system.initiative` are both recomputed from scratch in
 * prepareDerivedData() (actor-character.mjs) — a change applied during the default
 * "initial" ActiveEffect phase (before prepareDerivedData runs) is silently overwritten
 * by that recompute and never reaches the sheet. Any of the 7 embedded spell effects
 * created before this fix (compendium, or already cast on an actor/token) is missing
 * "phase": "final" on its change and needs patching in place — embedSpellEffect() above
 * only creates the effect when it's entirely absent, it won't fix one that already exists.
 */
async function fixSpellEffectPhase(doc) {
  const cfg = SPELL_EFFECTS[doc.name];
  if (!cfg) return false;
  const effect = doc.effects.get(cfg.id);
  if (!effect) return false;

  let changed = false;
  const changes = effect.changes.map(c => {
    const wanted = cfg.changes.find(cc => cc.key === c.key)?.phase;
    if (!wanted || c.phase === wanted) return c;
    changed = true;
    return { ...c, phase: wanted };
  });
  if (!changed) return false;

  await effect.update({ changes });
  return true;
}

async function applyEmbedSpellEffects() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedSpellEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await embedSpellEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Same as applyEmbedSpellEffects(), but also covers SPELL_CA_BONUS — a single
 *  combined "batch 2" fix (5 more embedded effects + 2 caBonus spells) so it can be
 *  offered under a fresh id: the original "0.6.98-embed-spell-effects" id, once
 *  checked off by a GM, is never re-run even after SPELL_EFFECTS grew new entries
 *  (see pack-update-picker gotcha — an id is marked applied regardless of whether
 *  re-running it would now do more work). */
async function applyEmbedMoreSpellEffects() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedSpellEffect(doc)) fixed++;
      if (await setSpellCaBonus(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await embedSpellEffect(item)) fixed++;
      if (await setSpellCaBonus(item)) fixed++;
    }
  }

  return fixed;
}

async function applyFixSpellEffectPhase() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixSpellEffectPhase(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await fixSpellEffectPhase(item)) fixed++;
    }
  }

  // Unlinked tokens hold their own independent copy of their actor's items —
  // not reachable through game.actors (see TODO_BUG_ANTIQUE.md point 37).
  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await fixSpellEffectPhase(item)) fixed++;
      }
    }
  }

  return fixed;
}

async function applyEmbedSpellGroupEffects() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedSpellGroupEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await embedSpellGroupEffect(item)) fixed++;
    }
  }

  // Unlinked tokens hold their own independent copy of their actor's items —
  // not reachable through game.actors (see TODO_BUG_ANTIQUE.md point 37).
  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await embedSpellGroupEffect(item)) fixed++;
      }
    }
  }

  return fixed;
}

/**
 * "Grâce des Astres Alignés" had zero embedded effects until now — its own dedicated
 * text ("Offre 1 point de chance à l'équipe ou 2 à une personne") went unmechanized
 * because system.pointsChance didn't exist yet. Embeds both the solo and group
 * versions in one pass, reusing embedSpellEffect()/embedSpellGroupEffect() (both
 * already no-op if the target effect exists) — same three-tier reach (compendium,
 * copies already possessed by an actor, copies on an unlinked token) as every other
 * spell-effect correctif.
 */
async function applyEmbedGraceAstresEffects() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedSpellEffect(doc)) fixed++;
      if (await embedSpellGroupEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await embedSpellEffect(item)) fixed++;
      if (await embedSpellGroupEffect(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await embedSpellEffect(item)) fixed++;
        if (await embedSpellGroupEffect(item)) fixed++;
      }
    }
  }

  return fixed;
}

/** Same 60 entries as packs/img/items/ — kept in sync by hand (see JOURNAL.md). */
const WEAPON_ARMOR_IMAGES = {
  "Couteau (Simple facture)": "systems/antique/img/items/couteau-simple.jpg",
  "Couteau (Bonne facture)": "systems/antique/img/items/couteau-bonne.jpg",
  "Couteau (Parfaite facture)": "systems/antique/img/items/couteau-parfaite.jpg",
  "Dague (Simple facture)": "systems/antique/img/items/dague-simple.jpg",
  "Dague (Moyenne facture)": "systems/antique/img/items/dague-moyenne.jpg",
  "Dague (Excellente facture)": "systems/antique/img/items/dague-excellente.jpg",
  "Dague (Parfaite facture)": "systems/antique/img/items/dague-parfaite.jpg",
  "Glaive (Simple facture)": "systems/antique/img/items/glaive-simple.jpg",
  "Glaive (Moyenne facture)": "systems/antique/img/items/glaive-moyenne.jpg",
  "Glaive (Bonne facture)": "systems/antique/img/items/glaive-bonne.jpg",
  "Glaive (Excellente facture)": "systems/antique/img/items/glaive-excellente.jpg",
  "Épée courte (Simple facture)": "systems/antique/img/items/epee-courte-simple.jpg",
  "Épée courte (Moyenne facture)": "systems/antique/img/items/epee-courte-moyenne.jpg",
  "Épée courte (Très bonne facture)": "systems/antique/img/items/epee-courte-tresbonne.jpg",
  "Lance (Moyenne facture)": "systems/antique/img/items/lance-moyenne.jpg",
  "Lance (Bonne facture)": "systems/antique/img/items/lance-bonne.jpg",
  "Hache (Simple facture)": "systems/antique/img/items/hache-simple.jpg",
  "Hache (Bonne facture)": "systems/antique/img/items/hache-bonne.jpg",
  "Hache (Très bonne facture)": "systems/antique/img/items/hache-tresbonne.jpg",
  "Hache (Parfaite facture)": "systems/antique/img/items/hache-parfaite.jpg",
  "Javeline (Simple facture)": "systems/antique/img/items/javeline-simple.jpg",
  "Javeline (Moyenne facture)": "systems/antique/img/items/javeline-moyenne.jpg",
  "Javeline (Bonne facture)": "systems/antique/img/items/javeline-bonne.jpg",
  "Hache de lancer (Moyenne facture)": "systems/antique/img/items/hache-de-lancer-moyenne.jpg",
  "Bolas (Simple facture)": "systems/antique/img/items/bolas-simple.jpg",
  "Bolas (Moyenne facture)": "systems/antique/img/items/bolas-moyenne.jpg",
  "Bouclier de lancer (Simple facture)": "systems/antique/img/items/bouclier-de-lancer-simple.png",
  "Bouclier de lancer (Moyenne facture)": "systems/antique/img/items/bouclier-de-lancer-moyenne.jpg",
  "Bouclier de lancer (Bonne facture)": "systems/antique/img/items/bouclier-de-lancer-bonne.jpg",
  "Filet (Simple facture)": "systems/antique/img/items/filet-simple.jpg",
  "Filet (Bonne facture)": "systems/antique/img/items/filet-bonne.jpg",
  "Couteau de lancer (Simple facture)": "systems/antique/img/items/couteau-de-lancer-simple.jpg",
  "Couteau de lancer (Bonne facture)": "systems/antique/img/items/couteau-de-lancer-bonne.jpg",
  "Chakram (Simple facture)": "systems/antique/img/items/chakram-simple.jpg",
  "Chakram (Moyenne facture)": "systems/antique/img/items/chakram-moyenne.jpg",
  "Chakram (Bonne facture)": "systems/antique/img/items/chakram-bonne.jpg",
  "Bâton (Simple facture)": "systems/antique/img/items/baton-simple.jpg",
  "Bâton (Moyenne facture)": "systems/antique/img/items/baton-moyenne.jpg",
  "Bâton (Bonne facture)": "systems/antique/img/items/baton-bonne.jpg",
  "Gourdin (Simple facture)": "systems/antique/img/items/gourdin-simple.jpg",
  "Gourdin (Bonne facture)": "systems/antique/img/items/gourdin-bonne.jpg",
  "Double hache (Simple facture)": "systems/antique/img/items/double-hache-simple.jpg",
  "Double hache (Moyenne facture)": "systems/antique/img/items/double-hache-moyenne.jpg",
  "Arc court (Simple facture)": "systems/antique/img/items/arc-court-simple.jpg",
  "Arc long (Simple facture)": "systems/antique/img/items/arc-long-simple.jpg",
  "Fronde (Simple facture)": "systems/antique/img/items/fronde-simple.jpg",
  "Fronde (Moyenne facture)": "systems/antique/img/items/fronde-moyenne.jpg",
  "Fouet (Simple facture)": "systems/antique/img/items/fouet-simple.jpg",
  "Fouet (Moyenne facture)": "systems/antique/img/items/fouet-moyenne.jpg",
  "Fouet (Bonne facture)": "systems/antique/img/items/fouet-bonne.jpg",
  "Arbalète (Simple facture)": "systems/antique/img/items/arbalete.jpg",
  "Arbalète (Moyenne facture)": "systems/antique/img/items/arbalete.jpg",
  "Arbalète (Bonne facture)": "systems/antique/img/items/arbalete.jpg",
  "Armure de cuir": "systems/antique/img/items/armure-de-cuir.jpg",
  "Armure de cuir cloutée": "systems/antique/img/items/armure-de-cuir-cloutee.jpg",
  "Armure de cuivre": "systems/antique/img/items/armure-de-cuivre.jpg",
  "Armure en plaque": "systems/antique/img/items/armure-en-plaque.jpg",
  "Armure en peau": "systems/antique/img/items/armure-en-peau.jpg",
  "Cuirasse": "systems/antique/img/items/cuirasse.jpg",
  "Carreaux d'arbalète": "systems/antique/img/items/carreaux-arbalete.jpg"
};

async function setItemImage(doc) {
  const img = WEAPON_ARMOR_IMAGES[doc.name];
  if (!img || doc.img === img) return false;
  await doc.update({ img });
  return true;
}

async function applyWeaponArmorRealImages() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type === "Item") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setItemImage(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "weapon" && item.type !== "equipment") continue;
      if (await setItemImage(item)) fixed++;
    }
  }

  return fixed;
}

async function applyWeaponArmorImagesUnlinkedTokens() {
  let fixed = 0;

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "weapon" && item.type !== "equipment") continue;
        if (await setItemImage(item)) fixed++;
      }
    }
  }

  return fixed;
}

/** Same 2 spells as the direct edit to packs/sorts.db — kept in sync by hand. Reuses the
 *  existing area-template mechanism (hasTemplate/templateRadius/templateTexture, already
 *  used by "Brouillard") rather than inventing anything new — these are the only 2 sorts
 *  in the Berserk audit (point 69) that specify an actual radius in their text.
 *  templateRadius is in real meters (system.json grid: distance 1.5, units "m"). */
const SPELL_TEMPLATES = {
  "Force Déchainée": { radius: 5, texture: "icons/magic/earth/barrier-stone-explosion-debris.webp" },
  "Hurlement de Bataille": { radius: 10, texture: "icons/magic/sonic/scream-wail-shout-teal.webp" }
};

async function setSpellTemplate(doc) {
  const cfg = SPELL_TEMPLATES[doc.name];
  if (!cfg || doc.system.hasTemplate) return false;
  await doc.update({
    "system.hasTemplate": true,
    "system.templateRadius": cfg.radius,
    "system.templateTexture": cfg.texture
  });
  return true;
}

async function applyAddSpellTemplates() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await setSpellTemplate(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await setSpellTemplate(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await setSpellTemplate(item)) fixed++;
      }
    }
  }

  return fixed;
}

/** Same 2 spells as the direct edit to packs/sorts.db — kept in sync by hand. Fixes a copy
 *  already created by applyAddSpellTemplates() above (0.6.125): its texture (borrowed from
 *  Brouillard, a single icon rather than a seamless tileable pattern) repeated visibly across
 *  the gabarit — replaced with a plain fillColor, no texture. Unlike setSpellTemplate() this
 *  overwrites unconditionally rather than skipping an already-configured template, since the
 *  point is precisely to correct what 0.6.125 already set. */
const SPELL_TEMPLATE_VISUAL_FIX = {
  "Force Déchainée": { color: "#c0392b" },
  "Hurlement de Bataille": { color: "#4a4e69" }
};

async function fixSpellTemplateVisual(doc) {
  const cfg = SPELL_TEMPLATE_VISUAL_FIX[doc.name];
  if (!cfg) return false;
  if (doc.system.templateTexture === "" && doc.system.templateColor === cfg.color) return false;
  await doc.update({ "system.templateTexture": "", "system.templateColor": cfg.color });
  return true;
}

/** Both spells name a difficulty in their own text. Force Déchainée ("jet de sauvegarde
 *  constitution diff 15") maps to "robustesse" (con+for), the closest existing save category
 *  — this system has no standalone Constitution save, same convention already used for
 *  npcability's saveAbility (ex. Regard pétrifiant/Robustesse DC 18). Hurlement de Bataille
 *  ("jet de sauvegarde pour ne pas fuir diff 15", a fear effect) maps to "volonte", same
 *  convention as the bestiary's fear abilities (ex. Gémissement/Rugissement, both
 *  saveAbility "volonte" in packs/capacites-combat.db). */
const SPELL_SAVE_CONFIG = {
  "Force Déchainée": { saveAbility: "robustesse", saveDC: 15 },
  "Hurlement de Bataille": { saveAbility: "volonte", saveDC: 15 }
};

async function setSpellSave(doc) {
  const cfg = SPELL_SAVE_CONFIG[doc.name];
  if (!cfg || doc.system.saveAbility === cfg.saveAbility) return false;
  await doc.update({ "system.saveAbility": cfg.saveAbility, "system.saveDC": cfg.saveDC });
  return true;
}

async function applyFixSpellTemplateAndSave() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixSpellTemplateVisual(doc)) fixed++;
      if (await setSpellSave(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await fixSpellTemplateVisual(item)) fixed++;
      if (await setSpellSave(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await fixSpellTemplateVisual(item)) fixed++;
        if (await setSpellSave(item)) fixed++;
      }
    }
  }

  return fixed;
}

/** Same 32 icons as the direct edit to packs/sorts.db — kept in sync by hand. Each of the
 *  32 spells shared just 4 generic placeholder icons (one per school: oak/fire/sword/skull)
 *  — replaced with a distinct icon per spell, every path checked against the local Foundry
 *  install before use (same care as the potion.svg 404, point 2). */
const SPELL_ICONS = {
  "Assistance": "icons/magic/control/buff-luck-fortune-clover-green.webp",
  "Baie nourriciere": "icons/consumables/food/berries-ration-round-red.webp",
  "Brouillard": "icons/magic/air/fog-gas-smoke-green.webp",
  "Malédiction": "icons/magic/control/voodoo-doll-pain-damage-purple.webp",
  "Localisation d'animaux ou plantes": "icons/magic/perception/orb-eye-scrying.webp",
  "Localisation d'objets": "icons/tools/scribal/magnifying-glass.webp",
  "Peau d'écorce": "icons/commodities/wood/bark-brown.webp",
  "Sens animal": "icons/creatures/abilities/paw-glowing-yellow.webp",
  "Gland des quatres chemins": "icons/consumables/nuts/acorn-glowing-brown.webp",
  "Langue de frêne": "icons/magic/nature/leaf-glow-green.webp",
  "Bénédiction des Titans": "icons/magic/control/buff-strength-muscle-damage-red.webp",
  "Danse du Serpent": "icons/creatures/reptiles/snake-poised-white.webp",
  "Résilience de l'Immortel": "icons/magic/defensive/armor-stone-skin.webp",
  "Eveil du Sage": "icons/sundries/books/book-open-purple.webp",
  "Méditation des Ancêtres": "icons/magic/holy/meditation-chi-focus-blue.webp",
  "Glamour Divin": "icons/magic/life/heart-pink.webp",
  "Souffle aux Pieds Legers": "icons/skills/movement/feet-winged-boots-blue.webp",
  "Grâce des Astres Alignés": "icons/magic/nature/symbol-moon-stars-white.webp",
  "Rage Incontrôlable": "icons/weapons/axes/axe-battle-eyes-red.webp",
  "Force Déchainée": "icons/magic/earth/barrier-stone-explosion-debris.webp",
  "Sang de Guerre": "icons/skills/wounds/blood-drip-droplet-red.webp",
  "Hurlement de Bataille": "icons/magic/sonic/scream-wail-shout-teal.webp",
  "Peau de Fer": "icons/magic/defensive/armor-shield-barrier-steel.webp",
  "Ignorance de la Douleur": "icons/skills/wounds/injury-body-pain-gray.webp",
  "Résilience du Sauvage": "icons/creatures/abilities/wolf-heads-swirl-purple.webp",
  "Lien de la Corneille": "icons/creatures/birds/corvid-watchful-glowing-green.webp",
  "Appel de la Corneille": "icons/creatures/birds/corvid-call-sound-blue.webp",
  "Oeil de Corneille": "icons/magic/perception/third-eye-blue-red.webp",
  "Prophétie du Sang": "icons/magic/perception/orb-crystal-ball-scrying-blue.webp",
  "Bain de Sang": "icons/skills/wounds/blood-spurt-spray-red.webp",
  "Nuée de Corneilles": "icons/creatures/birds/birds-flock-fly-yellow.webp",
  "Chant des Âmes Perdues": "icons/magic/death/undead-ghosts-trio-blue.webp"
};

async function setSpellIcon(doc) {
  const icon = SPELL_ICONS[doc.name];
  if (!icon || doc.img === icon) return false;
  await doc.update({ img: icon });
  return true;
}

async function applySpellRealIcons() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await setSpellIcon(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await setSpellIcon(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await setSpellIcon(item)) fixed++;
      }
    }
  }

  return fixed;
}

const RAGE_INCONTROLABLE_DESCRIPTION = "<p>Le berserk entre dans un état de rage, augmentant " +
  "temporairement sa force et sa résistance. Pendant la durée de la rage, il inflige des " +
  "dégâts supplémentaires, ignore la douleur, mais perd toute capacité à différencier allié " +
  "et ennemi</p>\n<p><strong>Durée :</strong> 10 tours</p>\n<p><strong>Effet :</strong> " +
  "Modificateur de dégâts: +1d6/ coup/ CA +1/ Si tous les ennemis sont tombés avant la fin " +
  "de la rage, un jet de sauvegarde de Volonté est nécessaire pour ne pas attaquer un allié</p>";

async function fixRageIncontrolableWording(doc) {
  if (doc.name !== "Rage Incontrôlable" || doc.system.description === RAGE_INCONTROLABLE_DESCRIPTION) return false;
  await doc.update({ "system.description": RAGE_INCONTROLABLE_DESCRIPTION });
  return true;
}

async function applyRageIncontrolableWording() {
  let fixed = 0;

  const pack = game.packs.get("antique.sorts");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixRageIncontrolableWording(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "spell") continue;
      if (await fixRageIncontrolableWording(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (item.type !== "spell") continue;
        if (await fixRageIncontrolableWording(item)) fixed++;
      }
    }
  }

  return fixed;
}

// --- 2026-09-18 full-codebase audit fixes -----------------------------------------

const FLASK_BROKEN_ICON = "icons/svg/flask.svg";
const FLASK_ICON_BY_NAME = {
  "Breuvage du Colosse": "icons/consumables/potions/bottle-bulb-empty-glass.webp",
  "Essence d'Acrobate": "icons/consumables/potions/potion-vial-tube-yellow.webp",
  "Philtre de l'Ours": "icons/consumables/potions/vial-cork-red.webp",
  "Liqueur du Vent": "icons/consumables/potions/potion-flash-open-blue.webp",
  "Elixir de l'Orateur": "icons/consumables/potions/vial-ornet-silver-black.webp",
  "Breuvage de l'Astre": "icons/consumables/potions/round-decorated-snake-green.webp",
  "Potion Simple": "icons/consumables/potions/potion-vial-corked-labeled-purple.webp",
  "Antidouleur": "icons/consumables/potions/vial-cork-green.webp"
};

async function fixFlaskIcon(item) {
  if (item.img !== FLASK_BROKEN_ICON) return false;
  const fixedIcon = FLASK_ICON_BY_NAME[item.name];
  if (!fixedIcon) return false;
  await item.update({ img: fixedIcon });
  return true;
}

async function applyFixFlaskIcons() {
  let fixed = 0;

  const pack = game.packs.get("antique.equipement");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixFlaskIcon(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    if (await fixFlaskIcon(item)) fixed++;
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (await fixFlaskIcon(item)) fixed++;
    }
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      for (const item of actor.items) {
        if (await fixFlaskIcon(item)) fixed++;
      }
    }
  }

  return fixed;
}

const WATER_BROKEN_ICON = "icons/svg/water.svg";
const WATERFALL_ICON = "icons/svg/waterfall.svg";

// "Combattant aquatique" is embedded (as an item, with its own embedded effect) on every
// bestiary creature that has it — same 3-level nesting the icon fix must reach.
async function fixWaterIconsOnItem(item) {
  let fixed = 0;
  if (item.name === "Combattant aquatique" && item.img === WATER_BROKEN_ICON) {
    await item.update({ img: WATERFALL_ICON });
    fixed++;
  }
  for (const effect of item.effects ?? []) {
    if (effect.img === WATER_BROKEN_ICON) {
      await effect.update({ img: WATERFALL_ICON });
      fixed++;
    }
  }
  return fixed;
}

async function fixWaterIconsOnActor(actor) {
  let fixed = 0;
  if (actor.name === "Triton" && actor.img === WATER_BROKEN_ICON) {
    await actor.update({ img: WATERFALL_ICON });
    fixed++;
  }
  for (const item of actor.items ?? []) {
    fixed += await fixWaterIconsOnItem(item);
  }
  return fixed;
}

async function applyFixWaterIcons() {
  let fixed = 0;

  const abilityPack = game.packs.get("antique.capacites-combat");
  if (abilityPack) {
    await abilityPack.configure({ locked: false });
    const index = await abilityPack.getIndex();
    for (const indexEntry of index) {
      const doc = await abilityPack.getDocument(indexEntry._id);
      fixed += await fixWaterIconsOnItem(doc);
    }
    await abilityPack.configure({ locked: true });
  }

  const creaturesPack = game.packs.get("antique.creatures");
  if (creaturesPack) {
    await creaturesPack.configure({ locked: false });
    const index = await creaturesPack.getIndex();
    for (const indexEntry of index) {
      const doc = await creaturesPack.getDocument(indexEntry._id);
      fixed += await fixWaterIconsOnActor(doc);
    }
    await creaturesPack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await fixWaterIconsOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixWaterIconsOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixWaterIconsOnActor(actor);
    }
  }

  return fixed;
}

const AQUATIC_FIGHTER_NAME = "Combattant aquatique";
// All 6 attack categories (see actor-npc.mjs's attackBonuses schema) — the ability
// originally only targeted armeBlanche (melee), confirmed too narrow by the user
// (2026-09-21): the bonus should apply to every attack, not just melee weapons.
const AQUATIC_FIGHTER_CATEGORIES = [
  "mainNue", "armeBlanche", "armeDeJet", "armeExotique", "combatDeuxMains", "armeADistance"
];

function buildAquaticFighterChanges() {
  const changes = AQUATIC_FIGHTER_CATEGORIES.map(cat => (
    { key: `system.attackBonuses.${cat}.total`, type: "add", value: "3" }
  ));
  changes.push({ key: "system.ca.value", type: "add", value: "2" });
  return changes;
}

// Same 3-level nesting as fixWaterIconsOnItem/OnActor above: the ability is embedded
// (as an Item, with its own embedded effect) on every copy of the Triton.
async function fixAquaticFighterScopeOnItem(item) {
  if (item.name !== AQUATIC_FIGHTER_NAME) return 0;
  let fixed = 0;
  for (const effect of item.effects ?? []) {
    if (effect.name !== AQUATIC_FIGHTER_NAME) continue;
    const alreadyAllCategories = AQUATIC_FIGHTER_CATEGORIES.every(cat =>
      effect.changes.some(c => c.key === `system.attackBonuses.${cat}.total`)
    );
    if (alreadyAllCategories) continue;
    await effect.update({
      changes: buildAquaticFighterChanges(),
      description: "+3 à l'attaque (toutes catégories) et +2 à la CA, tant que cet effet est actif."
    });
    fixed++;
  }
  return fixed;
}

async function fixAquaticFighterScopeOnActor(actor) {
  let fixed = 0;
  for (const item of actor.items ?? []) {
    fixed += await fixAquaticFighterScopeOnItem(item);
  }
  return fixed;
}

// Found 2026-09-21 via a screenshot of the ability's own sheet: the "Combattant aquatique"
// npcability Item itself carries TWO embedded ActiveEffects both named "Combattant
// aquatique" (not two copies of the Item, and not a stray effect directly on an actor —
// both of the earlier hypotheses in 0.6.133/0.6.134 above, neither of which actually
// touches this case). Predates this session's work — the deployed compendium/creatures
// LevelDB never matched the single-effect packs/*.db build source (see
// antique-system-overview memory: editing pack content never auto-propagates), so this was
// very likely already 2 on the live compendium item itself, not something introduced here.
// 0.6.133's fixAquaticFighterScopeOnItem() looped over every matching-named effect and
// corrected each one's `changes` individually, which is exactly why both already show the
// right 6-category values in the screenshot — it fixed the content of both duplicates
// without ever recognizing there were two to begin with.
async function fixAquaticFighterEffectDedupOnItem(item) {
  if (item.name !== AQUATIC_FIGHTER_NAME) return 0;
  const matching = item.effects?.filter(e => e.name === AQUATIC_FIGHTER_NAME) ?? [];
  if (matching.length <= 1) return 0;
  const [, ...extras] = matching;
  await item.deleteEmbeddedDocuments("ActiveEffect", extras.map(e => e.id));
  return extras.length;
}

async function fixAquaticFighterEffectDedupOnActor(actor) {
  let fixed = 0;
  for (const item of actor.items ?? []) {
    fixed += await fixAquaticFighterEffectDedupOnItem(item);
  }
  return fixed;
}

async function applyFixAquaticFighterEffectDedup() {
  let fixed = 0;

  const abilityPack = game.packs.get("antique.capacites-combat");
  if (abilityPack) {
    await abilityPack.configure({ locked: false });
    const index = await abilityPack.getIndex();
    for (const indexEntry of index) {
      const doc = await abilityPack.getDocument(indexEntry._id);
      fixed += await fixAquaticFighterEffectDedupOnItem(doc);
    }
    await abilityPack.configure({ locked: true });
  }

  const creaturesPack = game.packs.get("antique.creatures");
  if (creaturesPack) {
    await creaturesPack.configure({ locked: false });
    const index = await creaturesPack.getIndex();
    for (const indexEntry of index) {
      const doc = await creaturesPack.getDocument(indexEntry._id);
      fixed += await fixAquaticFighterEffectDedupOnActor(doc);
    }
    await creaturesPack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await fixAquaticFighterEffectDedupOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixAquaticFighterEffectDedupOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixAquaticFighterEffectDedupOnActor(actor);
    }
  }

  return fixed;
}

async function applyFixAquaticFighterScope() {
  let fixed = 0;

  const abilityPack = game.packs.get("antique.capacites-combat");
  if (abilityPack) {
    await abilityPack.configure({ locked: false });
    const index = await abilityPack.getIndex();
    for (const indexEntry of index) {
      const doc = await abilityPack.getDocument(indexEntry._id);
      fixed += await fixAquaticFighterScopeOnItem(doc);
    }
    await abilityPack.configure({ locked: true });
  }

  const creaturesPack = game.packs.get("antique.creatures");
  if (creaturesPack) {
    await creaturesPack.configure({ locked: false });
    const index = await creaturesPack.getIndex();
    for (const indexEntry of index) {
      const doc = await creaturesPack.getDocument(indexEntry._id);
      fixed += await fixAquaticFighterScopeOnActor(doc);
    }
    await creaturesPack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await fixAquaticFighterScopeOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixAquaticFighterScopeOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixAquaticFighterScopeOnActor(actor);
    }
  }

  return fixed;
}

// Cleanup for drift found in the user's own world (2026-09-21): "Combattant aquatique"
// showed up twice in the Effects panel on their Triton, which the source compendium data
// never had (verified single copy) — either the npcability Item itself got duplicated on
// that actor (each transferred copy doubling the bonus) at some earlier point, or a stray
// ActiveEffect was created directly on the actor outside of the Item (this ability should
// ONLY ever exist via the Item's transferred effect, never as a bare actor-level effect).
// Also resets the Triton's own base CA/attack-bonus fields back to their canonical values,
// since the pre-0.6.133 npc-sheet.mjs bug (see that entry) could have permanently baked an
// already-buffed number in as the new "raw" base on that actor (system.ca.value/
// attackBonuses.*.total have no separate base/total split for NPCs, unlike the character
// sheet — see npc-sheet.mjs's caSource/totalSource comment).
const TRITON_BASE_RESET = {
  "system.ca.value": 15,
  ...Object.fromEntries(AQUATIC_FIGHTER_CATEGORIES.map(cat => [`system.attackBonuses.${cat}.total`, 0]))
};

async function fixAquaticFighterDuplicatesOnActor(actor) {
  let fixed = 0;

  const abilityItems = actor.items?.filter(i => i.name === AQUATIC_FIGHTER_NAME) ?? [];
  if (abilityItems.length > 1) {
    const [, ...extras] = abilityItems;
    await actor.deleteEmbeddedDocuments("Item", extras.map(i => i.id));
    fixed += extras.length;
  }

  // Stray direct effects on the actor itself (not the item's transferred copy) — this
  // ability has no legitimate reason to exist there, so any found are simply removed.
  const strayEffects = actor.effects?.filter(e => e.name === AQUATIC_FIGHTER_NAME) ?? [];
  if (strayEffects.length) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", strayEffects.map(e => e.id));
    fixed += strayEffects.length;
  }

  for (const item of actor.items ?? []) {
    fixed += await fixAquaticFighterScopeOnItem(item);
  }

  if (actor.name === "Triton") {
    const rawSystem = actor._source.system;
    const needsReset = rawSystem.ca.value !== 15
      || AQUATIC_FIGHTER_CATEGORIES.some(cat => rawSystem.attackBonuses[cat]?.total !== 0);
    if (needsReset) {
      await actor.update(TRITON_BASE_RESET);
      fixed++;
    }
  }

  return fixed;
}

async function applyFixAquaticFighterDuplicates() {
  let fixed = 0;

  const creaturesPack = game.packs.get("antique.creatures");
  if (creaturesPack) {
    await creaturesPack.configure({ locked: false });
    const index = await creaturesPack.getIndex();
    for (const indexEntry of index) {
      const doc = await creaturesPack.getDocument(indexEntry._id);
      fixed += await fixAquaticFighterDuplicatesOnActor(doc);
    }
    await creaturesPack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixAquaticFighterDuplicatesOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixAquaticFighterDuplicatesOnActor(actor);
    }
  }

  return fixed;
}

const EPHISE_NAME = "Éphise - fils d'Eros";

// bonusSexe is absent from AntiqueCharacter's current schema, so the TypeDataModel
// already strips it silently at read time — actor.system.bonusSexe is never visible
// even when the raw stored data still has it. Check/clear via _source, not system.
async function fixEphiseBonusSexe(doc) {
  if (doc.name !== EPHISE_NAME || doc._source.system.bonusSexe === undefined) return false;
  await doc.update({ "system.-=bonusSexe": null });
  return true;
}

async function applyRemoveEphiseBonusSexe() {
  let fixed = 0;

  const pack = game.packs.get("antique.pnj");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixEphiseBonusSexe(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    if (await fixEphiseBonusSexe(actor)) fixed++;
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      if (await fixEphiseBonusSexe(actor)) fixed++;
    }
  }

  return fixed;
}

// User request (2026-09-21): every embedded effect's icon should always match the icon of
// the Item that carries it (a spell's effect uses the spell's own icon, a trait's effect
// uses the trait's own icon, etc.) — generic, not limited to any one item type. Static audit
// found 20 already-deployed effects still using a leftover generic icon (icons/svg/aura.svg
// / hazard.svg) from one-off scripts written before this project settled on always passing
// the parent's own icon (see fixWaterIconsOnItem and applyEmbedEffetsSimple's
// embedMissingEffect() above, both already correct). Fixed at the source in packs/*.db —
// this generic pass reaches every already-deployed copy, and (being generic rather than a
// fixed list of names) also catches any future content that drifts the same way.
async function fixEffectIconsMatchParentOnItem(item) {
  if (!item.img) return 0;
  let fixed = 0;
  for (const effect of item.effects ?? []) {
    if (effect.img === item.img) continue;
    await effect.update({ img: item.img });
    fixed++;
  }
  return fixed;
}

async function fixEffectIconsMatchParentOnActor(actor) {
  let fixed = 0;
  for (const item of actor.items ?? []) {
    fixed += await fixEffectIconsMatchParentOnItem(item);
  }
  return fixed;
}

// Every Item-type pack (system.json → packs[].type === "Item") — walked generically rather
// than naming only the 3 packs the audit actually found mismatches in, so this stays correct
// if a future pack gains the same drift.
const EFFECT_ICON_ITEM_PACKS = [
  "armes", "equipement", "avantages", "desavantages", "benedictions",
  "avantages-divins", "alchimie", "sorts", "capacites-combat", "tresors"
];
// Every Actor-type pack, whose embedded Items can each carry their own effects.
const EFFECT_ICON_ACTOR_PACKS = ["pnj", "dieux", "creatures"];

async function applyFixEffectIconsMatchParent() {
  let fixed = 0;

  for (const packName of EFFECT_ICON_ITEM_PACKS) {
    const pack = game.packs.get(`antique.${packName}`);
    if (!pack) continue;
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      fixed += await fixEffectIconsMatchParentOnItem(doc);
    }
    await pack.configure({ locked: true });
  }

  for (const packName of EFFECT_ICON_ACTOR_PACKS) {
    const pack = game.packs.get(`antique.${packName}`);
    if (!pack) continue;
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      fixed += await fixEffectIconsMatchParentOnActor(doc);
    }
    await pack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await fixEffectIconsMatchParentOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixEffectIconsMatchParentOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixEffectIconsMatchParentOnActor(actor);
    }
  }

  return fixed;
}

// User report (2026-09-21, screenshot of the native compendium sidebar for "armes"):
// duplicate Folder documents — same category, differing only by a missing accent
// ("Arme a deux mains" vs "Arme à deux mains") or capitalization ("Arme de jet" vs "Arme de
// Jet") — sitting empty alongside the real one holding the actual weapons. `packs/*.db`'s
// folder docs (the only source of truth for names/colors/ids) were never duplicated —
// this is pure deployed-world drift: `overwriteSystemCompendiums()` (version-check.mjs)
// upserts folders by `_id` and deliberately never deletes anything absent from the source,
// so an old/renamed folder id from an earlier project era survives forever once orphaned,
// even after its canonical replacement is created under a new id. Reaches every pack that
// actually uses compendium folders (system.json's other Item packs have none).
const PACK_CANONICAL_FOLDERS = {
  armes: [
    { id: "fArm000000000001", name: "Arme blanche", color: "#8B0000" },
    { id: "fArm000000000002", name: "Arme de jet", color: "#8B0000" },
    { id: "fArm000000000003", name: "Arme exotique", color: "#8B0000" },
    { id: "fArm000000000004", name: "Arme à deux mains", color: "#8B0000" },
    { id: "fArm000000000005", name: "Arme à distance", color: "#8B0000" },
    { id: "fArm000000000006", name: "Armure", color: "#2F4F4F" },
    { id: "fArm000000000007", name: "Bouclier", color: "#2F4F4F" },
    { id: "fArm000000000120", name: "Munition", color: "#8B0000" }
  ],
  sorts: [
    { id: "fSrt000000000001", name: "Rituels", color: "#6A0DAD" },
    { id: "fSrt000000000002", name: "Sorts de Druide", color: "#2E8B57" },
    { id: "fSrt000000000013", name: "Rituels d'Hécate", color: "#8B008B" },
    { id: "fSrt000000000022", name: "Sorts de Berserk — Camulos", color: "#B22222" },
    { id: "fSrt000000000030", name: "Sorts de Morrigan", color: "#1C1C1C" }
  ],
  "avantages-divins": [
    { id: "fDiv000000000001", name: "Dieux Majeurs Grecs", color: "#DAA520" },
    { id: "fDiv000000000068", name: "Dieux Majeurs Egyptiens", color: "#CD853F" },
    { id: "fDiv000000000081", name: "Dieux Majeurs Celtes", color: "#2E8B57" },
    { id: "fDiv000000000094", name: "Dieux Majeurs Nordique", color: "#4682B4" }
  ],
  alchimie: [
    { id: "fAlc000000000001", name: "Ingrédients Communs", color: "#8B7355" },
    { id: "fAlc000000000046", name: "Ingrédients Peu Communs", color: "#6A5ACD" },
    { id: "fAlc000000000071", name: "Ingrédients Rares", color: "#B22222" },
    { id: "fAlc000000000094", name: "Potions Bénéfiques", color: "#2E8B57" },
    { id: "fAlc000000000108", name: "Potions Négatives", color: "#8B0000" }
  ]
};

function normalizeFolderName(name) {
  return name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

async function dedupePackFolders(pack, canonicalFolders) {
  let fixed = 0;
  const canonicalByName = new Map(canonicalFolders.map(c => [normalizeFolderName(c.name), c]));
  const canonicalIds = new Set(canonicalFolders.map(c => c.id));

  const groups = new Map();
  for (const folder of pack.folders) {
    const key = normalizeFolderName(folder.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(folder);
  }

  // Fetched once, before any deletion below — each duplicate is checked against this same
  // snapshot by its own (still-valid) id, so moving one duplicate's items doesn't affect
  // the check for another.
  const index = await pack.getIndex({ fields: ["folder"] });

  for (const [key, folders] of groups) {
    if (folders.length <= 1) continue;
    const keep = folders.find(f => canonicalIds.has(f.id)) ?? folders[0];

    const canonical = canonicalByName.get(key);
    if (canonical && (keep.name !== canonical.name || keep.color !== canonical.color)) {
      await keep.update({ name: canonical.name, color: canonical.color });
      fixed++;
    }

    for (const folder of folders) {
      if (folder === keep) continue;
      const orphaned = index.filter(e => e.folder === folder.id);
      for (const entry of orphaned) {
        const doc = await pack.getDocument(entry._id);
        await doc.update({ folder: keep.id });
        fixed++;
      }
      await folder.delete();
      fixed++;
    }
  }

  return fixed;
}

async function applyDedupePackFolders() {
  let fixed = 0;
  for (const [packName, canonicalFolders] of Object.entries(PACK_CANONICAL_FOLDERS)) {
    const pack = game.packs.get(`antique.${packName}`);
    if (!pack) continue;
    await pack.configure({ locked: false });
    fixed += await dedupePackFolders(pack, canonicalFolders);
    await pack.configure({ locked: true });
  }
  return fixed;
}


// User request (2026-09-21): "peux-tu trouver des icônes pour les avantages, les
// désavantages et les bénédictions ?" — almost every advantage/disadvantage shared one of
// only 2 generic icons (icons/svg/upgrade.svg / downgrade.svg), and the 15-god x 4-tier
// "devotion" subset (60 in each pack) all shared icons/svg/sun.svg. Every path below was
// verified to exist in the local Foundry v14 install before being committed here (same
// discipline as the historical potion.svg/water.svg/flask.svg bugs this project keeps
// re-learning from) — see JOURNAL.md for the full god/theme reasoning. Devotion items for
// the same god (both the blessing track in avantages.db and the mirrored curse track in
// desavantages.db) intentionally share one icon per god across all 4 tiers.
const TRAIT_ICONS = {
  "(-1) Guerrier Aguerri": "systems/antique/img/aventage/guerrier_aguerri.jpg",
  "(-1) Sens aiguisé": "icons/magic/perception/eye-ringed-green.webp",
  "(-1) Equilibre félin": "systems/antique/img/aventage/equilibre_félin.jpg",
  "(-1) Fetard": "systems/antique/img/aventage/fetard.png",
  "(-1) Bon sens": "icons/magic/perception/third-eye-blue-red.webp",
  "(-1) Sens artistique": "systems/antique/img/aventage/sens_artistique.png",
  "(-1) Athléte": "systems/antique/img/aventage/athlète.png",
  "(-1) Sang froid": "systems/antique/img/aventage/sang_froid.png",
  "(-1) Commercant": "icons/skills/trades/academics-merchant-scribe.webp",
  "(-1) Visage passe partout": "systems/antique/img/aventage/visage_passe_partout.jpg",
  "(-1) Peau dense": "systems/antique/img/aventage/peau_dense.png",
  "(-1) Mule": "systems/antique/img/aventage/mule.jpg",
  "(-1) Vif": "systems/antique/img/aventage/vif.png",
  "(-1) Cuir de Hero": "systems/antique/img/aventage/cuir_de_hero.png",
  "(-1) Pisteur": "systems/antique/img/aventage/pisteur.png",
  "(-1) Sommeil leger": "systems/antique/img/aventage/sommeil_leger.png",
  "(-1) Faveur": "icons/svg/coins.svg",
  "(-1) Colère de Zeus": "icons/svg/lightning.svg",
  "(-1) Respect d'Héra": "systems/antique/img/aventage/respect_d'héra.png",
  "(-1) Branchies de Poséidon": "systems/antique/img/aventage/branchie_de_poséidon.jpg",
  "(-1) Protection d'Athéna": "systems/antique/img/aventage/protection_d'athéna.jpg",
  "(-1) Rage d'Arès": "systems/antique/img/aventage/rage_d'arès.jpg",
  "(-1) Cuisine de Déméter": "systems/antique/img/aventage/cuisine_de_démététer.png",
  "(-1) Soin d'Apollon": "systems/antique/img/aventage/soin_d'apollon.png",
  "(-1) Chasse d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(-1) Connaissance d'Héphaistos": "systems/antique/img/aventage/connaissance_d'hephaistos.jpg",
  "(-1) Beauté d'Aphrodite": "systems/antique/img/aventage/beauté_d'Aphrodite.png",
  "(-1) Mains d'Hèrmès": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(-1) Ivresse de Dionysos": "systems/antique/img/aventage/ivresse_de_dionysos.jpg",
  "(-1) Chaleur d'Hestia": "systems/antique/img/aventage/chaleur_d'hestia.jpg",
  "(-1) Vue d'Hécate": "systems/antique/img/aventage/vue_d'hécate.jpg",
  "(-1) Don d'Hadès": "systems/antique/img/aventage/don_d'hadès.jpg",
  "(-2) Orientation": "systems/antique/img/aventage/orientation.png",
  "(-2) Porte bouclier": "systems/antique/img/aventage/porte_bouclier.png",
  "(-2) Chrono sens": "systems/antique/img/aventage/chrono_sens.jpg",
  "(-2) Don des langues": "systems/antique/img/aventage/don_des_langues.jpg",
  "(-2) Voix enchanteresse": "icons/skills/trades/music-singing-voice-blue.webp",
  "(-2) Volonté de fer": "icons/svg/mage-shield.svg",
  "(-2) Ami des animaux": "systems/antique/img/aventage/amis_des_animaux.png",
  "(-2) Maitre d'Arme": "systems/antique/img/aventage/maitre_d'arme.jpg",
  "(-2) Maitre des forges": "systems/antique/img/aventage/maitre_des_forges.jpg",
  "(-2) Ambidextrie": "systems/antique/img/aventage/ambidextrie.png",
  "(-2) Faveur +": "systems/antique/img/aventage/faveur_+.jpg",
  "(-2) Etincelle de Zeus": "systems/antique/img/aventage/eteincelle_de_zeus.jpg",
  "(-2) Vision d'Héra": "systems/antique/img/aventage/visée_d'héra.jpg",
  "(-2) Force de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(-2) Voix d'Athéna": "icons/creatures/birds/raptor-owl-flying-moon.webp",
  "(-2) Corps d'Arès": "systems/antique/img/aventage/corps_d'arès.jpg",
  "(-2) Moisson de Déméter": "systems/antique/img/aventage/moisson_de_déméter.jpg",
  "(-2) Visée d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(-2) Mire d'Artèmis": "systems/antique/img/aventage/mire_d'artémis.jpg",
  "(-2) Talent d'Héphaistos": "systems/antique/img/aventage/talen_d'hepahistos.jpg",
  "(-2) Charme d'Aphrodite": "icons/magic/life/heart-glowing-red.webp",
  "(-2) Pieds d'Hermes": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(-2) Talent de Dionysos": "systems/antique/img/aventage/talen_de_dionysos.jpg",
  "(-2) Flamme d'Hestia": "systems/antique/img/aventage/flammes_d'hestia.jpg",
  "(-2) Lanterne d'Hécate": "systems/antique/img/aventage/lanterne_d'hecate.jpg",
  "(-2) Casque d'Hadès": "systems/antique/img/aventage/casque_d'hadès.png",
  "(-3) Taille imposante": "icons/svg/statue.svg",
  "(-3) Dieu de l'esquive": "systems/antique/img/aventage/dieux_de_l'esquive.jpg",
  "(-3) Dieu du stade": "icons/svg/walk.svg",
  "(-3) Dieu de la guerre": "systems/antique/img/aventage/dieux_de_la_guerre.png",
  "(-3) Rageux": "systems/antique/img/aventage/rageux.jpg",
  "(-3) Faveur ++": "systems/antique/img/aventage/faveur_+_+.png",
  "(-3) Aura de Zeus": "icons/svg/lightning.svg",
  "(-3) Aura d'Héra": "systems/antique/img/aventage/aura_d'héra.jpg",
  "(-3) Aura de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(-3) Aura d'Athéna": "systems/antique/img/aventage/aura_d'athéna.jpg",
  "(-3) Aura d'Arès": "systems/antique/img/aventage/aura_d'arès.jpg",
  "(-3) Aura de Demeter": "icons/skills/trades/farming-wheat-circle-yellow.webp",
  "(-3) Aura d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(-3) Aura d'Artèmis": "systems/antique/img/aventage/aura_d'artemis.jpg",
  "(-3) Aura d'Héphaïstos": "systems/antique/img/aventage/aura_d'héphaistos.jpg",
  "(-3) Aura d'Aphrodite": "systems/antique/img/aventage/aura d'aphrodite.jpg",
  "(-3) Aura d'Hermes": "systems/antique/img/aventage/aura_d'hermes.jpg",
  "(-3) Aura de Dionysos": "systems/antique/img/aventage/aura_de_dionysos.jpg",
  "(-3) Aura d'Hestia": "icons/magic/fire/flame-burning-campfire-orange.webp",
  "(-3) Aura d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(-3) Aura d'Hadès": "icons/svg/skull.svg",
  "(-5) Sang de Zeus": "systems/antique/img/aventage/sang_de_zeus.png",
  "(-5) Faveur de la Dame": "systems/antique/img/aventage/faveur_de_la_dame.jpg",
  "(-5) Paume de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(-5) Esprit d'Athéna": "systems/antique/img/aventage/esprit_d'athéna.jpg",
  "(-5) Armure d'Arès": "systems/antique/img/aventage/armure_d'arès.jpg",
  "(-5) Blé de Déméter": "systems/antique/img/aventage/blé_de_déméter.jpg",
  "(-5) Oeil d'Apollon": "systems/antique/img/aventage/oeil_d'apollon.jpg",
  "(-5) Compagnon d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(-5) Yeux d'Héphaistos": "systems/antique/img/aventage/yeux_d'hephaistos.jpg",
  "(-5) Murmure d'Aphrodite": "systems/antique/img/aventage/murmure_d'aphrodite.jpg",
  "(-5) Message d'Hermes": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(-5) Amphore de Dionysos": "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "(-5) Bucher d'Héstia": "systems/antique/img/aventage/bucher_d'héstia.jpg",
  "(-5) Lune d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(-5) Peau d'Hadès": "icons/svg/skull.svg",
  "(1) Phobie": "icons/svg/terror.svg",
  "(1) Sens défaïllant": "icons/magic/perception/eye-slit-red-orange.webp",
  "(1) Dépendance légal": "icons/consumables/drinks/alcohol-jug-spirits-brown.webp",
  "(1) Marmotte": "icons/magic/nature/moon-crescent.webp",
  "(1) Cauchemards": "icons/magic/death/undead-ghost-scream-teal.webp",
  "(1) Coeur sensible": "icons/magic/life/heart-pink.webp",
  "(1) Sosie": "icons/svg/mystery-man-black.svg",
  "(1) Dette": "icons/skills/social/trading-injustice-scale-gray.webp",
  "(1) Frêle": "icons/skills/wounds/bone-broken-marrow-yellow.webp",
  "(1) Petite nature": "icons/svg/poison.svg",
  "(1) Enfant": "icons/skills/social/thumbs-down.webp",
  "(1) Distrait": "icons/magic/perception/eye-slit-pink.webp",
  "(1) Dépressif": "icons/svg/daze.svg",
  "(1) Maladroit": "icons/svg/falling.svg",
  "(1) Superstitieux": "icons/magic/symbols/clover-luck-white-green.webp",
  "(1) Introverti": "icons/skills/social/wave-halt-stop.webp",
  "(1) Sinistre": "icons/magic/unholy/silhouette-robe-evil-glow.webp",
  "(1) Moquerie de Zeus": "icons/svg/lightning.svg",
  "(1) Paranoïa d'Héra": "icons/creatures/birds/corvid-watchful-glowing-green.webp",
  "(1) Tempête de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(1) Chouette d'Athéna": "icons/creatures/birds/raptor-owl-flying-moon.webp",
  "(1) Poigne d'Arès": "icons/svg/blood.svg",
  "(1) Carence de Déméter": "icons/skills/trades/farming-wheat-circle-yellow.webp",
  "(1) Arc d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(1) Proie d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(1) Confiance d'Héphaïstos": "icons/skills/trades/smithing-anvil-brown.webp",
  "(1) Outrage d'Aphrodite": "icons/magic/life/heart-glowing-red.webp",
  "(1) Geste d'Hermès": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(1) Coupe de Dionysos": "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "(1) Destin d'Hestia": "icons/magic/fire/flame-burning-campfire-orange.webp",
  "(1) Perte d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(1) Horde d'Hadès": "icons/svg/skull.svg",
  "(2) Gravement malade": "icons/skills/wounds/illness-disease-glowing-green.webp",
  "(2) Hostilité animal": "icons/magic/nature/wolf-paw-glow-orange.webp",
  "(2) Phobie majeur": "icons/magic/death/skull-horned-white-purple.webp",
  "(2) Loi d'Atrée": "icons/sundries/scrolls/scroll-runed-brown.webp",
  "(2) Dette +": "icons/skills/social/trading-injustice-scale-gray.webp",
  "(2) Hanté": "icons/magic/death/undead-ghosts-trio-blue.webp",
  "(2) Culpabilité écrasante": "icons/magic/holy/prayer-hands-glowing-yellow.webp",
  "(2) Amnésie": "icons/skills/trades/academics-investigation-puzzles.webp",
  "(2) Blessure permanente": "icons/skills/wounds/injury-body-pain-gray.webp",
  "(2) Impétueux": "icons/svg/explosion.svg",
  "(2) Amoureux transit": "icons/magic/life/heart-broken-red.webp",
  "(2) Présence de Zeus": "icons/svg/lightning.svg",
  "(2) Présence d'Héra": "icons/creatures/birds/corvid-watchful-glowing-green.webp",
  "(2) Présence de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(2) Présence d'Athéna": "icons/creatures/birds/raptor-owl-flying-moon.webp",
  "(2) Présence d'Arès": "icons/svg/blood.svg",
  "(2) Présence de Déméter": "icons/skills/trades/farming-wheat-circle-yellow.webp",
  "(2) Présence d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(2) Présence d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(2) Présence d'Héphaïstos": "icons/skills/trades/smithing-anvil-brown.webp",
  "(2) Présence d'Aphrodite": "icons/magic/life/heart-glowing-red.webp",
  "(2) Présence d'Hermès": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(2) Présence de Dionysos": "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "(2) Présence d'Hestia": "icons/magic/fire/flame-burning-campfire-orange.webp",
  "(2) Présence d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(2) Présence d'Hadès": "icons/svg/skull.svg",
  "(3) Dépendance illégal": "icons/consumables/drinks/alcohol-spirits-bottle-green.webp",
  "(3) Tache de naissance": "icons/magic/symbols/circled-gem-pink.webp",
  "(3) Némésis": "icons/svg/tower-flag.svg",
  "(3) Recherché": "icons/sundries/documents/document-sealed-red-tan.webp",
  "(3) Chat Noir": "icons/creatures/mammals/cat-hunched-glowing-red.webp",
  "(3) Zélé": "icons/svg/temple.svg",
  "(3) Dette ++": "icons/skills/social/trading-injustice-scale-gray.webp",
  "(3) Syndrome de Zeus": "icons/svg/lightning.svg",
  "(3) Jugement d'Héra": "icons/creatures/birds/corvid-watchful-glowing-green.webp",
  "(3) Maladie de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(3) Sens d'Athéna": "icons/creatures/birds/raptor-owl-flying-moon.webp",
  "(3) Serment d'Arès": "icons/svg/blood.svg",
  "(3) Pollen de Déméter": "icons/skills/trades/farming-wheat-circle-yellow.webp",
  "(3) Diagnostique d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(3) Marche d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(3) Defaut d'Héphaïstos": "icons/skills/trades/smithing-anvil-brown.webp",
  "(3) Ragot d'Aphrodite": "icons/magic/life/heart-glowing-red.webp",
  "(3) Lubie d'Hermès": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(3) Insertion de Dionysos": "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "(3) Honte d'Hestia": "icons/magic/fire/flame-burning-campfire-orange.webp",
  "(3) Marque d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(3) Prix d'Hadès": "icons/svg/skull.svg",
  "(5) Danse de Zeus": "icons/svg/lightning.svg",
  "(5) Jalousie d'Hera": "icons/creatures/birds/corvid-watchful-glowing-green.webp",
  "(5) Lignée de Poséidon": "icons/magic/water/wave-water-blue.webp",
  "(5) Défi d'Athéna": "icons/creatures/birds/raptor-owl-flying-moon.webp",
  "(5) Fureur d'Arès": "icons/svg/blood.svg",
  "(5) Tristesse de Déméter": "icons/skills/trades/farming-wheat-circle-yellow.webp",
  "(5) Maux d'Apollon": "icons/magic/light/beam-rays-yellow.webp",
  "(5) Chatiment d'Artèmis": "icons/skills/ranged/archery-bow-attack-yellow.webp",
  "(5) Poursuite d'Héphaïstos": "icons/skills/trades/smithing-anvil-brown.webp",
  "(5) Déni d'Aphrodite": "icons/magic/life/heart-glowing-red.webp",
  "(5) Bande d'Hermès": "icons/skills/movement/feet-winged-boots-blue.webp",
  "(5) Folie de Dionysos": "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "(5) Déception d'Hestia": "icons/magic/fire/flame-burning-campfire-orange.webp",
  "(5) Terreur d'Hécate": "icons/sundries/misc/key-ornate-iron-black.webp",
  "(5) Jugement d'Hadès": "icons/svg/skull.svg",
  "Faveur d'Athéna": "icons/svg/eye.svg",
  "Force d'Héraclès": "icons/svg/combat.svg",
  "Vitesse d'Hermès": "icons/svg/lightning.svg",
  "Regard d'Apollon": "icons/svg/sun.svg",
  "Protection de Poséidon": "icons/svg/frozen.svg",
  "Ruse d'Ulysse": "icons/svg/cowled.svg",
  "Grâce d'Artémis": "icons/svg/target.svg",
  "Forge d'Héphaïstos": "icons/svg/clockwork.svg",
  "Terreur d'Arès": "icons/svg/terror.svg",
  "Sagesse de Chiron": "icons/svg/book.svg",
  "Beauté divine": "icons/magic/life/heart-glowing-red.webp",
  "Corps d'Arès": "icons/svg/fire-shield.svg",
};

async function applyTraitIconOnItem(item) {
  const img = TRAIT_ICONS[item.name];
  if (!img) return 0;
  let fixed = 0;
  if (item.img !== img) {
    await item.update({ img });
    fixed++;
  }
  for (const effect of item.effects ?? []) {
    if (effect.img !== img) {
      await effect.update({ img });
      fixed++;
    }
  }
  return fixed;
}

async function applyTraitIconOnActor(actor) {
  let fixed = 0;
  for (const item of actor.items ?? []) {
    fixed += await applyTraitIconOnItem(item);
  }
  return fixed;
}

async function applyFixTraitIcons() {
  let fixed = 0;

  for (const packName of ["avantages", "desavantages", "benedictions"]) {
    const pack = game.packs.get(`antique.${packName}`);
    if (!pack) continue;
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      fixed += await applyTraitIconOnItem(doc);
    }
    await pack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await applyTraitIconOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await applyTraitIconOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await applyTraitIconOnActor(actor);
    }
  }

  return fixed;
}



// Found 2026-09-21 following a user report ("Bénédiction des Titans n'a plus d'effet
// applicable", then confirmed on "Danse du Serpent" too): 64 embedded effects across
// avantages/benedictions/desavantages/equipement/pnj/sorts were stored in a legacy shape —
// a root-level "icon" field (ActiveEffect's real field is "img" — see
// resources/app/common/documents/active-effect.mjs's defineSchema, no "icon" field exists)
// and a root-level "changes" array instead of the schema's "system.changes" (ActiveEffect
// DOES have a "system" TypeDataField). Source data corrected directly to this same shape.
//
// IMPORTANT — v1 of this fix (0.6.141, called effect.update() with a "type" change plus
// "-=changes"/"-=icon" deletion directives in the same call) turned out to WIPE the
// targeted effects to an empty array on the user's live compendium instead of fixing them,
// despite reporting success with no thrown error — repairable only via "Écraser mes
// compendiums" (a full document overwrite from the corrected mirror, bypassing whatever
// Foundry does internally when a type change and a nested system field land in the same
// update() call). v2 avoids that whole class of risk: delete the malformed effect and
// createEmbeddedDocuments() a brand new one with keepId — never partially updates one that
// already exists, so there is nothing for a type-change side effect to interact with.
const LEGACY_EFFECT_SHAPE_FIXES = [
  { itemName: "(-1) Sens aiguisé", effectName: "Sens aiguisé", data: {"_id":"41c2f31f181b7d38","name":"Sens aiguisé","img":"icons/magic/perception/eye-ringed-green.webp","type":"base","system":{"changes":[{"key":"system.skills.perception.bonus","type":"add","value":"2"}]},"description":"Choisir un sens qui sera aiguisé (+2 bonus perception sens)","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Sens artistique", effectName: "Sens artistique", data: {"_id":"939a8f47caf8cc57","name":"Sens artistique","img":"systems/antique/img/aventage/sens_artistique.png","type":"base","system":{"changes":[{"key":"system.skills.representation.bonus","type":"add","value":"2"}]},"description":"Vous maitrisez un art ce qui vous donne +2 en representation/ art","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Athléte", effectName: "Athléte", data: {"_id":"eAdv000000000007","name":"Athléte","img":"systems/antique/img/aventage/athlète.png","type":"base","system":{"changes":[{"key":"system.deplacement","type":"multiply","value":"2"}]},"description":"Capacité de deplacement x2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Sang froid", effectName: "Sang froid", data: {"_id":"0fea338781e177f6","name":"Sang froid","img":"systems/antique/img/aventage/sang_froid.png","type":"base","system":{"changes":[{"key":"system.saves.volonte.bonus","type":"add","value":"2"}]},"description":"Vous resistez à la peur +2 en volonté","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Peau dense", effectName: "Peau dense", data: {"_id":"896803080d8a4f08","name":"Peau dense","img":"systems/antique/img/aventage/peau_dense.png","type":"base","system":{"changes":[{"key":"system.ca.base","type":"add","value":"2"}]},"description":"Augmente la CA de Base de 2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Vif", effectName: "Vif", data: {"_id":"bfdca7587860d398","name":"Vif","img":"systems/antique/img/aventage/vif.png","type":"base","system":{"changes":[{"key":"system.saves.reflexes.bonus","type":"add","value":"2"}]},"description":"Réflexe base+2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Cuir de Hero", effectName: "Cuir de Hero", data: {"_id":"4dca7a1996d4803b","name":"Cuir de Hero","img":"systems/antique/img/aventage/cuir_de_hero.png","type":"base","system":{"changes":[{"key":"system.saves.robustesse.bonus","type":"add","value":"2"}]},"description":"Robustesse base+2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Pisteur", effectName: "Pisteur", data: {"_id":"c5bf303ebbc36892","name":"Pisteur","img":"systems/antique/img/aventage/pisteur.png","type":"base","system":{"changes":[{"key":"system.skills.vigueur.bonus","type":"add","value":"2"},{"key":"system.skills.nature.bonus","type":"add","value":"2"}]},"description":"La chasse n'as pas de secret pour vous +2 vig et nature/ dans la nature","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Colère de Zeus", effectName: "Colère de Zeus (+3 dégâts)", data: {"_id":"eAdv000000000035_01","name":"Colère de Zeus (+3 dégâts)","img":"icons/svg/lightning.svg","type":"base","system":{"changes":[{"key":"system.attackBonuses.armeBlanche.damageBonus","type":"add","value":"3","priority":20}]},"description":"Dégats aux corps à corps +3","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-1) Protection d'Athéna", effectName: "Protection d'Athéna", data: {"_id":"514e468f96aee99f","name":"Protection d'Athéna","img":"systems/antique/img/aventage/protection_d'athéna.jpg","type":"base","system":{"changes":[{"key":"system.ca.base","type":"add","value":"2"}]},"description":"Augmente la CA de +2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-2) Voix enchanteresse", effectName: "Voix enchanteresse", data: {"_id":"0fb0d53d5a4891b3","name":"Voix enchanteresse","img":"icons/skills/trades/music-singing-voice-blue.webp","type":"base","system":{"changes":[{"key":"system.skills.seduction.bonus","type":"add","value":"2"},{"key":"system.skills.baratin.bonus","type":"add","value":"2"}]},"description":"Auriez vous du sang de sirène, car votre voix est hypnotique (+2 certaines comp Char)","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-2) Force de Poséidon", effectName: "Force de Poséidon", data: {"_id":"333057f8380d7c03","name":"Force de Poséidon","img":"icons/magic/water/wave-water-blue.webp","type":"base","system":{"changes":[{"key":"system.ca.base","type":"add","value":"1"}]},"description":"Augmente la CA de +1 de l'équipe (+2 si proche de la mer)","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-2) Corps d'Arès", effectName: "Corps d'Arès", data: {"_id":"ab6d4306d1573a2a","name":"Corps d'Arès","img":"systems/antique/img/aventage/corps_d'arès.jpg","type":"base","system":{"changes":[{"key":"system.ca.base","type":"add","value":"2"}]},"description":"Renforce la CA de +2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-2) Visée d'Apollon", effectName: "Visée d'Apollon", data: {"_id":"787a8db4f2596060","name":"Visée d'Apollon","img":"icons/magic/light/beam-rays-yellow.webp","type":"base","system":{"changes":[{"key":"system.attackBonuses.armeADistance.bonus","type":"add","value":"2"}]},"description":"Permet d'ajouter un bonus de 2 au arme a distance","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(-3) Taille imposante", effectName: "Taille imposante", data: {"_id":"aa2220c89bda5985","name":"Taille imposante","img":"icons/svg/statue.svg","type":"base","system":{"changes":[{"key":"system.pv.max","type":"add","value":"10"}]},"description":"Mesure dans les 2M, point de vie augmenter de 10","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Faveur d'Athéna", effectName: "Faveur d'Athéna", data: {"_id":"eBle000000000001","name":"Faveur d'Athéna","img":"icons/svg/eye.svg","type":"base","system":{"changes":[{"key":"system.abilities.int.mod","mode":2,"value":"2"},{"key":"system.skills.tactique.bonus","mode":2,"value":"1"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Force d'Héraclès", effectName: "Force d'Héraclès", data: {"_id":"eBle000000000002","name":"Force d'Héraclès","img":"icons/svg/combat.svg","type":"base","system":{"changes":[{"key":"system.abilities.for.mod","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Vitesse d'Hermès", effectName: "Vitesse d'Hermès", data: {"_id":"eBle000000000003","name":"Vitesse d'Hermès","img":"icons/svg/lightning.svg","type":"base","system":{"changes":[{"key":"system.abilities.dex.mod","mode":2,"value":"2"},{"key":"system.skills.acrobatie.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Regard d'Apollon", effectName: "Regard d'Apollon", data: {"_id":"eBle000000000004","name":"Regard d'Apollon","img":"icons/svg/sun.svg","type":"base","system":{"changes":[{"key":"system.skills.perception.bonus","mode":2,"value":"2"},{"key":"system.skills.premierSoin.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Protection de Poséidon", effectName: "Protection de Poséidon", data: {"_id":"eBle000000000005","name":"Protection de Poséidon","img":"icons/svg/frozen.svg","type":"base","system":{"changes":[{"key":"system.ca.temp","mode":2,"value":"1"},{"key":"system.skills.natation.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Ruse d'Ulysse", effectName: "Ruse d'Ulysse", data: {"_id":"eBle000000000006","name":"Ruse d'Ulysse","img":"icons/svg/cowled.svg","type":"base","system":{"changes":[{"key":"system.skills.baratin.bonus","mode":2,"value":"2"},{"key":"system.skills.dissimulation.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Grâce d'Artémis", effectName: "Grâce d'Artémis", data: {"_id":"eBle000000000007","name":"Grâce d'Artémis","img":"icons/svg/target.svg","type":"base","system":{"changes":[{"key":"system.skills.armeADistance.bonus","mode":2,"value":"2"},{"key":"system.skills.survie.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Forge d'Héphaïstos", effectName: "Forge d'Héphaïstos", data: {"_id":"eBle000000000008","name":"Forge d'Héphaïstos","img":"icons/svg/clockwork.svg","type":"base","system":{"changes":[{"key":"system.skills.artisanatFor.bonus","mode":2,"value":"2"},{"key":"system.skills.artisanatDex.bonus","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Terreur d'Arès", effectName: "Terreur d'Arès", data: {"_id":"eBle000000000009","name":"Terreur d'Arès","img":"icons/svg/terror.svg","type":"base","system":{"changes":[{"key":"system.skills.intimidation.bonus","mode":2,"value":"3"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Sagesse de Chiron", effectName: "Sagesse de Chiron", data: {"_id":"eBle000000000010","name":"Sagesse de Chiron","img":"icons/svg/book.svg","type":"base","system":{"changes":[{"key":"system.skills.premierSoin.bonus","mode":2,"value":"2"},{"key":"system.skills.nature.bonus","mode":2,"value":"2"},{"key":"system.skills.mythologie.bonus","mode":2,"value":"1"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Beauté divine", effectName: "Beauté divine", data: {"_id":"eBle000000000011","name":"Beauté divine","img":"icons/magic/life/heart-glowing-red.webp","type":"base","system":{"changes":[{"key":"system.abilities.cha.mod","mode":2,"value":"1"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Corps d'Arès", effectName: "Corps d'Arès", data: {"_id":"eBle000000000012","name":"Corps d'Arès","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.temp","mode":2,"value":"2"}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(1) Sens défaïllant", effectName: "Sens défaïllant", data: {"_id":"4f38b968cd8cc302","name":"Sens défaïllant","img":"icons/magic/perception/eye-slit-red-orange.webp","type":"base","system":{"changes":[{"key":"system.skills.perception.bonus","mode":2,"value":"-2"}]},"description":"Choisir un sens qui sera défaïllant (-2 bonus perception sens)","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(1) Frêle", effectName: "Frêle", data: {"_id":"b70f2d00445a307e","name":"Frêle","img":"icons/skills/wounds/bone-broken-marrow-yellow.webp","type":"base","system":{"changes":[{"key":"system.saves.robustesse.base","mode":2,"value":"-1"}]},"description":"Robustesse de base -1","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(1) Distrait", effectName: "Distrait", data: {"_id":"dd125fc8bf70aa1d","name":"Distrait","img":"icons/magic/perception/eye-slit-pink.webp","type":"base","system":{"changes":[{"key":"system.skills.vigilance.bonus","mode":2,"value":"-2"}]},"description":"Vous avez un désavantage en vigilance -2","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(1) Dépressif", effectName: "Dépressif", data: {"_id":"4556af58ee86599e","name":"Dépressif","img":"icons/svg/daze.svg","type":"base","system":{"changes":[{"key":"system.saves.volonte.base","mode":2,"value":"-1"}]},"description":"Volonté de base -1","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "(1) Maladroit", effectName: "Maladroit", data: {"_id":"6477a5916ec74614","name":"Maladroit","img":"icons/svg/falling.svg","type":"base","system":{"changes":[{"key":"system.saves.reflexes.base","mode":2,"value":"-1"}]},"description":"Reflexe de base -1","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Linothorax", effectName: "Linothorax", data: {"_id":"eEff000000000001","name":"Linothorax","img":"icons/svg/holy-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Thorax de cuir", effectName: "Thorax de cuir", data: {"_id":"eEff000000000002","name":"Thorax de cuir","img":"icons/svg/holy-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Cuirasse de bronze", effectName: "Cuirasse de bronze", data: {"_id":"eEff000000000003","name":"Cuirasse de bronze","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"4","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Armure d'hoplite complète", effectName: "Armure d'hoplite complète", data: {"_id":"eEff000000000004","name":"Armure d'hoplite complète","img":"icons/svg/mage-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"6","priority":null},{"key":"system.skills.esquive.bonus","mode":2,"value":"-2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Casque corinthien", effectName: "Casque corinthien", data: {"_id":"eEff000000000005","name":"Casque corinthien","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"1","priority":null},{"key":"system.skills.perception.bonus","mode":2,"value":"-1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Casque chalcidien", effectName: "Casque chalcidien", data: {"_id":"eEff000000000006","name":"Casque chalcidien","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Cnémides de bronze", effectName: "Cnémides de bronze", data: {"_id":"eEff000000000007","name":"Cnémides de bronze","img":"icons/svg/holy-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.armure","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Aspis (bouclier rond)", effectName: "Aspis", data: {"_id":"eEff000000000008","name":"Aspis","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.bouclier","mode":2,"value":"2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Peltè (bouclier léger)", effectName: "Peltè", data: {"_id":"eEff000000000009","name":"Peltè","img":"icons/svg/holy-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.bouclier","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Bénédiction des Titans", effectName: "Bénédiction des Titans", data: {"_id":"eSrt000000000001","name":"Bénédiction des Titans","img":"icons/magic/control/buff-strength-muscle-damage-red.webp","type":"base","system":{"changes":[{"key":"system.abilities.for.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Force (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Bénédiction des Titans", effectName: "Bénédiction des Titans (Groupe)", data: {"_id":"eSrtG00000000001","name":"Bénédiction des Titans (Groupe)","img":"icons/magic/control/buff-strength-muscle-damage-red.webp","type":"base","system":{"changes":[{"key":"system.abilities.for.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Force (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Danse du Serpent", effectName: "Danse du Serpent", data: {"_id":"eSrt000000000002","name":"Danse du Serpent","img":"icons/creatures/reptiles/snake-poised-white.webp","type":"base","system":{"changes":[{"key":"system.abilities.dex.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Dextérité (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Danse du Serpent", effectName: "Danse du Serpent (Groupe)", data: {"_id":"eSrtG00000000002","name":"Danse du Serpent (Groupe)","img":"icons/creatures/reptiles/snake-poised-white.webp","type":"base","system":{"changes":[{"key":"system.abilities.dex.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Dextérité (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Résilience de l'Immortel", effectName: "Résilience de l'Immortel", data: {"_id":"eSrt000000000003","name":"Résilience de l'Immortel","img":"icons/magic/defensive/armor-stone-skin.webp","type":"base","system":{"changes":[{"key":"system.abilities.con.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Constitution (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Résilience de l'Immortel", effectName: "Résilience de l'Immortel (Groupe)", data: {"_id":"eSrtG00000000004","name":"Résilience de l'Immortel (Groupe)","img":"icons/magic/defensive/armor-stone-skin.webp","type":"base","system":{"changes":[{"key":"system.abilities.con.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Constitution (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Eveil du Sage", effectName: "Eveil du Sage", data: {"_id":"eSrt000000000004","name":"Eveil du Sage","img":"icons/sundries/books/book-open-purple.webp","type":"base","system":{"changes":[{"key":"system.abilities.int.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Intelligence (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Eveil du Sage", effectName: "Eveil du Sage (Groupe)", data: {"_id":"eSrtG00000000003","name":"Eveil du Sage (Groupe)","img":"icons/sundries/books/book-open-purple.webp","type":"base","system":{"changes":[{"key":"system.abilities.int.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Intelligence (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Méditation des Ancêtres", effectName: "Méditation des Ancêtres", data: {"_id":"eSrt000000000005","name":"Méditation des Ancêtres","img":"icons/magic/holy/meditation-chi-focus-blue.webp","type":"base","system":{"changes":[{"key":"system.abilities.ast.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Astuce (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Méditation des Ancêtres", effectName: "Méditation des Ancêtres (Groupe)", data: {"_id":"eSrtG00000000005","name":"Méditation des Ancêtres (Groupe)","img":"icons/magic/holy/meditation-chi-focus-blue.webp","type":"base","system":{"changes":[{"key":"system.abilities.ast.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Astuce (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Glamour Divin", effectName: "Glamour Divin", data: {"_id":"eSrt000000000006","name":"Glamour Divin","img":"icons/magic/life/heart-pink.webp","type":"base","system":{"changes":[{"key":"system.abilities.cha.mod","mode":2,"value":"3","phase":"abilities"}]},"description":"+3 Charisme (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Glamour Divin", effectName: "Glamour Divin (Groupe)", data: {"_id":"eSrtG00000000006","name":"Glamour Divin (Groupe)","img":"icons/magic/life/heart-pink.webp","type":"base","system":{"changes":[{"key":"system.abilities.cha.mod","mode":2,"value":"1","phase":"abilities"}]},"description":"+1 Charisme (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Souffle aux Pieds Legers", effectName: "Souffle aux Pieds Legers", data: {"_id":"eSrt000000000007","name":"Souffle aux Pieds Legers","img":"icons/skills/movement/feet-winged-boots-blue.webp","type":"base","system":{"changes":[{"key":"system.initiative","mode":2,"value":"4","phase":"final"}]},"description":"+4 Initiative (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Souffle aux Pieds Legers", effectName: "Souffle aux Pieds Legers (Groupe)", data: {"_id":"eSrtG00000000007","name":"Souffle aux Pieds Legers (Groupe)","img":"icons/skills/movement/feet-winged-boots-blue.webp","type":"base","system":{"changes":[{"key":"system.initiative","mode":2,"value":"2","phase":"final"}]},"description":"+2 Initiative (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Grâce des Astres Alignés", effectName: "Grâce des Astres Alignés", data: {"_id":"eSrt000000000008","name":"Grâce des Astres Alignés","img":"icons/magic/nature/symbol-moon-stars-white.webp","type":"base","system":{"changes":[{"key":"system.pointsChance","mode":2,"value":"2"}]},"description":"+2 Points de Chance (version solo).","transfer":false,"disabled":false,"flags":{}} },
  { itemName: "Grâce des Astres Alignés", effectName: "Grâce des Astres Alignés (Groupe)", data: {"_id":"eSrtG00000000008","name":"Grâce des Astres Alignés (Groupe)","img":"icons/magic/nature/symbol-moon-stars-white.webp","type":"base","system":{"changes":[{"key":"system.pointsChance","mode":2,"value":"1"}]},"description":"+1 Point de Chance (version groupe).","transfer":false,"disabled":false,"flags":{"antique":{"spellScope":"group"}}} },
  { itemName: "Aura d'Aphrodite", effectName: "Aura d'Aphrodite", data: {"_id":"eEph000000000001","name":"Aura d'Aphrodite","img":"icons/svg/aura.svg","type":"base","system":{"changes":[{"key":"system.skills.seduction.bonus","mode":2,"value":"3","priority":null},{"key":"system.skills.baratin.bonus","mode":2,"value":"2","priority":null},{"key":"system.skills.empathie.bonus","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Beauté d'Aphrodite", effectName: "Beauté d'Aphrodite", data: {"_id":"eEph000000000002","name":"Beauté d'Aphrodite","img":"icons/svg/angel.svg","type":"base","system":{"changes":[{"key":"system.skills.representation.bonus","mode":2,"value":"2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Rage d'Arès", effectName: "Rage d'Arès", data: {"_id":"eEph000000000003","name":"Rage d'Arès","img":"icons/svg/combat.svg","type":"base","system":{"changes":[{"key":"system.skills.combatMainNue.bonus","mode":2,"value":"2","priority":null},{"key":"system.skills.intimidation.bonus","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Présence d'Aphrodite", effectName: "Présence d'Aphrodite", data: {"_id":"eEph000000000004","name":"Présence d'Aphrodite","img":"icons/svg/eye.svg","type":"base","system":{"changes":[{"key":"system.skills.discretion.bonus","mode":2,"value":"-3","priority":null},{"key":"system.skills.dissimulation.bonus","mode":2,"value":"-2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Dette ++", effectName: "Dette ++", data: {"_id":"eEph000000000005","name":"Dette ++","img":"icons/svg/downgrade.svg","type":"base","system":{"changes":[{"key":"system.skills.marchandage.bonus","mode":2,"value":"-2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Beauté divine", effectName: "Beauté divine", data: {"_id":"eEph000000000006","name":"Beauté divine","img":"icons/svg/sun.svg","type":"base","system":{"changes":[{"key":"system.abilities.cha.mod","mode":2,"value":"1","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
  { itemName: "Corps d'Arès", effectName: "Corps d'Arès", data: {"_id":"eEph000000000007","name":"Corps d'Arès","img":"icons/svg/fire-shield.svg","type":"base","system":{"changes":[{"key":"system.ca.temp","mode":2,"value":"2","priority":null}]},"description":"","transfer":true,"disabled":false,"flags":{}} },
];

// Handles both cases found on the user's world: an effect still present but in the legacy
// shape (delete + recreate), AND an effect missing entirely — the state 0.6.141's buggy
// effect.update() actually left behind (wiped to an empty effects array, not just malformed)
// — by checking every fix that applies to this item BY NAME rather than only looking at
// what's currently in item.effects. Running "Écraser mes compendiums" first is no longer a
// prerequisite for this to work.
async function fixLegacyEffectShapeOnItem(item) {
  const itemFixes = LEGACY_EFFECT_SHAPE_FIXES.filter(f => f.itemName === item.name);
  if (!itemFixes.length) return 0;

  const toDeleteIds = [];
  const toCreateData = [];
  for (const fix of itemFixes) {
    const existing = item.effects.find(e => e.name === fix.effectName);
    if (existing) toDeleteIds.push(existing.id);
    toCreateData.push(fix.data);
  }
  if (toDeleteIds.length) await item.deleteEmbeddedDocuments("ActiveEffect", toDeleteIds);
  await item.createEmbeddedDocuments("ActiveEffect", toCreateData, { keepId: true });
  return toCreateData.length;
}

async function fixLegacyEffectShapeOnActor(actor) {
  let fixed = 0;
  for (const item of actor.items ?? []) {
    fixed += await fixLegacyEffectShapeOnItem(item);
  }
  return fixed;
}

const LEGACY_EFFECT_SHAPE_ITEM_PACKS = ["avantages", "benedictions", "desavantages", "equipement", "sorts"];

async function applyFixLegacyEffectShape() {
  let fixed = 0;

  for (const packName of LEGACY_EFFECT_SHAPE_ITEM_PACKS) {
    const pack = game.packs.get(`antique.${packName}`);
    if (!pack) continue;
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      fixed += await fixLegacyEffectShapeOnItem(doc);
    }
    await pack.configure({ locked: true });
  }

  const pnjPack = game.packs.get("antique.pnj");
  if (pnjPack) {
    await pnjPack.configure({ locked: false });
    const index = await pnjPack.getIndex();
    for (const indexEntry of index) {
      const doc = await pnjPack.getDocument(indexEntry._id);
      fixed += await fixLegacyEffectShapeOnActor(doc);
    }
    await pnjPack.configure({ locked: true });
  }

  for (const item of game.items ?? []) {
    fixed += await fixLegacyEffectShapeOnItem(item);
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixLegacyEffectShapeOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixLegacyEffectShapeOnActor(actor);
    }
  }

  return fixed;
}

// Foundry tracks any embedded/world document that fails schema validation in a collection's
// own `invalidDocumentIds` Set (see common/abstract/document.mjs and client's
// document-collection.mjs/embedded-collection.mjs) rather than exposing it through the
// collection's normal iteration — a plain `for (const item of actor.items)` silently never
// sees these, so they can't be found or deleted through the usual document APIs. Reading
// `collection._source` directly (the raw stored array, always present regardless of
// validation) is the only way to inspect what an invalid entry actually is.
function findInvalidEffectTypeItemIds(collection) {
  const ids = [];
  for (const id of collection.invalidDocumentIds) {
    const raw = collection._source.find(d => d._id === id);
    if (raw?.type === "effect") ids.push(id);
  }
  return ids;
}

async function fixInvalidEffectTypeItemsOnActor(actor) {
  const ids = findInvalidEffectTypeItemIds(actor.items);
  if (!ids.length) return 0;
  await actor.deleteEmbeddedDocuments("Item", ids);
  return ids.length;
}

async function applyFixInvalidEffectTypeItems() {
  let fixed = 0;

  const worldIds = findInvalidEffectTypeItemIds(game.items);
  if (worldIds.length) {
    await Item.deleteDocuments(worldIds);
    fixed += worldIds.length;
  }

  for (const actor of game.actors ?? []) {
    fixed += await fixInvalidEffectTypeItemsOnActor(actor);
  }

  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      fixed += await fixInvalidEffectTypeItemsOnActor(actor);
    }
  }

  return fixed;
}

const SETTING_KEY = "appliedPackFixes";

/**
 * Réglage monde caché mémorisant les `id` de PACK_UPDATES déjà appliqués — un correctif
 * absent de cette liste reste "en attente" et sera reproposé à chaque login GM, même sans
 * changement de version (contrairement à checkSystemVersionUpdate()). Appeler depuis le
 * hook "init", à côté de registerVersionCheckSettings()/registerMigrationSettings().
 */
export function registerPackUpdateSettings() {
  game.settings.register("antique", SETTING_KEY, {
    name: "Correctifs de compendium déjà appliqués à ce monde",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
}

function getAppliedIds() {
  return game.settings.get("antique", SETTING_KEY) ?? [];
}

export async function markPackUpdatesApplied(ids) {
  if (!ids.length) return;
  const applied = new Set(getAppliedIds());
  for (const id of ids) applied.add(id);
  await game.settings.set("antique", SETTING_KEY, Array.from(applied));
}

export function getPendingPackUpdates() {
  const applied = new Set(getAppliedIds());
  return PACK_UPDATES.filter(update => !applied.has(update.id));
}

/**
 * GM-only. Ouvre l'écran de choix par compendium s'il reste des correctifs en attente —
 * aucun lien avec checkSystemVersionUpdate() : se redéclenche à chaque login GM tant que
 * des entrées de PACK_UPDATES n'ont pas été explicitement appliquées, changement de
 * version ou pas. Call from the "ready" hook, GM only.
 */
export async function checkPendingPackUpdates() {
  if (!game.user.isGM) return;

  const pending = getPendingPackUpdates();
  if (!pending.length) return;

  const { AntiquePackUpdatePicker } = await import("../apps/pack-update-picker.mjs");
  AntiquePackUpdatePicker.open();
}
