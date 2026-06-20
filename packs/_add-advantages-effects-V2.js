// ============================================================================
// Script: Ajout/Modification/Retrait des ActiveEffects aux avantages
// Version: 2.0 - Interactive
// Auteur: Mistral Vibe
// Date: 2025
// Description: Script interactif pour gérer les effets des avantages
// ============================================================================

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const readline = require('readline');

// ============================================================================
// CONFIGURATION
// ============================================================================

const COMPENDIUM_PATH = path.join(__dirname, 'avantages');

// Mode de fonctionnement
const MODES = {
  LIST: 'list',           // Lister tous les avantages
  ADD: 'add',            // Ajouter des effets
  REMOVE: 'remove',       // Retirer des effets
  INTERACTIVE: 'interactive' // Mode interactif
};

// ============================================================================
// MAPPING COMPLET DES EFFETS
// ============================================================================

const ALL_ADVANTAGES = {
  // Coût -1 : Généraux
  "aAdv000000000001": { name: "Guerrier Aguerri", cost: -1, category: "Général", 
    effectText: "Offre une deuxieme action de combat",
    changes: [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000002": { name: "Sens aiguisé", cost: -1, category: "Général", 
    effectText: "Choisir un sens qui sera aiguisé (+2 bonus perception sens)",
    changes: [{ key: "system.skills.perception.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000003": { name: "Équilibre félin", cost: -1, category: "Général", 
    effectText: "Pas de malus sur terrain difficile",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000004": { name: "Fêtard", cost: -1, category: "Général", 
    effectText: "Pas de malus du à l'alcool/manque de sommeil",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000005": { name: "Bon sens", cost: -1, category: "Général", 
    effectText: "Une petite voix dans votre tête vous conseil parfois",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000006": { name: "Sens artistique", cost: -1, category: "Général", 
    effectText: "Vous maitrisez un art ce qui vous donne +2 en representation/art",
    changes: [{ key: "system.skills.representation.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000007": { name: "Athlète", cost: -1, category: "Général", 
    effectText: "Capacité de deplacement x2",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000008": { name: "Sang froid", cost: -1, category: "Général", 
    effectText: "Vous resistez à la peur +2 en volonté",
    changes: [{ key: "system.saves.volonte.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000009": { name: "Commerçant", cost: -1, category: "Général", 
    effectText: "Augmente vos possibilités de commerce (vente et achat)",
    changes: [{ key: "system.skills.marchandage.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000010": { name: "Visage passe-partout", cost: -1, category: "Général", 
    effectText: "Votre visage n'as rien de particulier, on vous oublie facilement",
    changes: [{ key: "system.skills.discretion.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000011": { name: "Peau dense", cost: -1, category: "Général", 
    effectText: "Augmente la CA de Base de 2",
    changes: [{ key: "system.ca.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000012": { name: "Mule", cost: -1, category: "Général", 
    effectText: "Augmente les capacité de kg porté par 2",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000013": { name: "Vif", cost: -1, category: "Général", 
    effectText: "Réflexe base+2",
    changes: [{ key: "system.saves.reflexes.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000014": { name: "Cuir de Héros", cost: -1, category: "Général", 
    effectText: "Robustesse base+2",
    changes: [{ key: "system.saves.robustesse.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000015": { name: "Pisteur", cost: -1, category: "Général", 
    effectText: "La chasse n'as pas de secret pour vous +2 vig et nature/ dans la nature",
    changes: [
      { key: "system.skills.vigueur.bonus", mode: 2, value: 2 },
      { key: "system.skills.nature.bonus", mode: 2, value: 2 }
    ],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000016": { name: "Sommeil léger", cost: -1, category: "Général", 
    effectText: "Vous dormez d'une oreille, avantage en cas de reveil soudain",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000017": { name: "Faveur", cost: -1, category: "Général", 
    effectText: "Un lambda vous dois une faveur (au choix)",
    changes: [], type: "passive", priority: 3 },

  // Coût -1 : Divins
  "aAdv000000000035": { name: "Colère de Zeus", cost: -1, category: "Divin", devotion: "Zeus",
    effectText: "Dégats aux corps à corps +3",
    changes: [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000039": { name: "Respect d'Héra", cost: -1, category: "Divin", devotion: "Hera",
    effectText: "Tu peux percevoir la trahison dans ton entourage",
    changes: [{ key: "system.skills.psychologie.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000043": { name: "Branchies de Poséidon", cost: -1, category: "Divin", devotion: "Poseïdon",
    effectText: "Permet 1d6/lvl de régéneration avec de l'eau",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000047": { name: "Protection d'Athéna", cost: -1, category: "Divin", devotion: "Athéna",
    effectText: "Augmente la CA de +2",
    changes: [{ key: "system.ca.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000051": { name: "Rage d'Arès", cost: -1, category: "Divin", devotion: "Arès",
    effectText: "Permet de faire deux attaques/ tour",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000055": { name: "Cuisine de Déméter", cost: -1, category: "Divin", devotion: "Demeter",
    effectText: "Permet de faire des rations régénératives 10 pv",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000059": { name: "Soin d'Apollon", cost: -1, category: "Divin", devotion: "Apollon",
    effectText: "Permet de stabiliser un allié 2/j",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000063": { name: "Chasse d'Artémis", cost: -1, category: "Divin", devotion: "Artémis",
    effectText: "Chasse assuré",
    changes: [
      { key: "system.skills.nature.bonus", mode: 2, value: 2 },
      { key: "system.skills.vigueur.bonus", mode: 2, value: 2 }
    ],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000067": { name: "Connaissance d'Héphaïstos", cost: -1, category: "Divin", devotion: "Héphaïstos",
    effectText: "Réduit la CA adverse de 2",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000071": { name: "Beauté d'Aphrodite", cost: -1, category: "Divin", devotion: "Aphrodite",
    effectText: "Permet de capter l'attention ou la rejeter au combat",
    changes: [{ key: "system.skills.seduction.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000075": { name: "Mains d'Hermès", cost: -1, category: "Divin", devotion: "Hermes",
    effectText: "Permet de voler un petit objet avec 1 chance sur 6 dtetre reperer",
    changes: [{ key: "system.skills.escamotage.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000079": { name: "Ivresse de Dionysos", cost: -1, category: "Divin", devotion: "Dionysos",
    effectText: "Permet de renforcer les effets de l'alcool",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000083": { name: "Chaleur d'Hestia", cost: -1, category: "Divin", devotion: "Hestia",
    effectText: "Vous inspirez confiance",
    changes: [{ key: "system.skills.commandement.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000087": { name: "Vue d'Hécate", cost: -1, category: "Divin", devotion: "Hécate",
    effectText: "Permet de toujours connaitre la voie à prendre",
    changes: [{ key: "system.skills.navigation.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000091": { name: "Don d'Hadès", cost: -1, category: "Divin", devotion: "Hadès",
    effectText: "Permet de voir et de communiquer avec les morts reçents",
    changes: [], type: "passive", priority: 3 },

  // Coût -2 : Généraux
  "aAdv000000000018": { name: "Orientation", cost: -2, category: "Général",
    effectText: "Vous savez toujours vous reperer dans l'espace",
    changes: [{ key: "system.skills.navigation.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000019": { name: "Porte-bouclier", cost: -2, category: "Général",
    effectText: "Vous avez un avantage lorsque vous étes le bouclier d'un autre",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000020": { name: "Chrono-sens", cost: -2, category: "Général",
    effectText: "Vous savez toujours quand vous etes",
    changes: [{ key: "system.skills.histoire.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000021": { name: "Don des langues", cost: -2, category: "Général",
    effectText: "Polyglotte",
    changes: [{ key: "system.skills.linguistique.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000022": { name: "Voix enchanteresse", cost: -2, category: "Général",
    effectText: "Auriez vous du sang de sirène, car votre voix est hypnotique (+2 certaines comp Char)",
    changes: [
      { key: "system.skills.seduction.bonus", mode: 2, value: 2 },
      { key: "system.skills.baratin.bonus", mode: 2, value: 2 }
    ],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000023": { name: "Volonté de fer", cost: -2, category: "Général",
    effectText: "vous n'avez peur de rien et vous etes rarement prit au dépourvu",
    changes: [{ key: "system.saves.volonte.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000024": { name: "Ami des animaux", cost: -2, category: "Général",
    effectText: "Vous avez grandis avec des animaux ce qui augmente leurs confiance en vous",
    changes: [{ key: "system.skills.dressage.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000025": { name: "Maître d'Arme", cost: -2, category: "Général",
    effectText: "Vous etes un maitre du maniement d'une arme +2 si vous l'utilisez",
    changes: [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000026": { name: "Maître des forges", cost: -2, category: "Général",
    effectText: "Votre talent en forgeronerie vous permet de construire ou reparer en toute circonstance",
    changes: [{ key: "system.skills.artisanatFor.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000027": { name: "Ambidextrie", cost: -2, category: "Général",
    effectText: "Vos deux mains sont majeure, vous n'avez pas de faiblesse ni d'un coté ni de l'autre",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000028": { name: "Faveur +", cost: -2, category: "Général",
    effectText: "Un membre respecté vous dois une faveur (au choix)",
    changes: [], type: "passive", priority: 3 },

  // Coût -2 : Divins
  "aAdv000000000036": { name: "Étincelle de Zeus", cost: -2, category: "Divin", devotion: "Zeus",
    effectText: "1/4 chance de Stun 1 tour avec une arme",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000040": { name: "Vision d'Héra", cost: -2, category: "Divin", devotion: "Hera",
    effectText: "1 fois par jour: permet d'avoir des Info sur une personne connu",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000044": { name: "Force de Poséidon", cost: -2, category: "Divin", devotion: "Poseïdon",
    effectText: "Augmente la CA de +1 de l'équipe (+2 si proche de la mer)",
    changes: [{ key: "system.ca.base", mode: 2, value: 1 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000048": { name: "Voix d'Athéna", cost: -2, category: "Divin", devotion: "Athéna",
    effectText: "Peut forcer quelqu'un a obeir a un ordre 1/j",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000052": { name: "Corps d'Arès", cost: -2, category: "Divin", devotion: "Arès",
    effectText: "Renforce la CA de +2",
    changes: [{ key: "system.ca.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000056": { name: "Moisson de Déméter", cost: -2, category: "Divin", devotion: "Demeter",
    effectText: "Permet de trouver de la nourriture (végétaux)",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000060": { name: "Visée d'Apollon", cost: -2, category: "Divin", devotion: "Apollon",
    effectText: "Permet d'ajouter un bonus de 2 au arme a distance",
    changes: [{ key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 2 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000064": { name: "Mire d'Artémis", cost: -2, category: "Divin", devotion: "Artémis",
    effectText: "Dégats à distance +3",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000068": { name: "Talent d'Héphaïstos", cost: -2, category: "Divin", devotion: "Héphaïstos",
    effectText: "Augmente les dégats de corps a corps +3",
    changes: [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000072": { name: "Charme d'Aphrodite", cost: -2, category: "Divin", devotion: "Aphrodite",
    effectText: "Réduit le jet de touche de l'adversaire de 2",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000076": { name: "Pieds d'Hermès", cost: -2, category: "Divin", devotion: "Hermes",
    effectText: "Augmente la distance de marche de 4 cases",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000080": { name: "Talent de Dionysos", cost: -2, category: "Divin", devotion: "Dionysos",
    effectText: "Resistance à la drogue et l'alcool",
    changes: [{ key: "system.saves.robustesse.base", mode: 2, value: 2 }],
    type: "mechanical", priority: 1 },
  
  "aAdv000000000084": { name: "Flamme d'Hestia", cost: -2, category: "Divin", devotion: "Hestia",
    effectText: "Votre corps est plus chaud que la moyenne pas de pénalité froid/humide",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000088": { name: "Lanterne d'Hécate", cost: -2, category: "Divin", devotion: "Hécate",
    effectText: "Permet de voir dans le noir",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000092": { name: "Casque d'Hadès", cost: -2, category: "Divin", devotion: "Hadès",
    effectText: "Permet de disparaitre dans les ombres 2/J",
    changes: [], type: "passive", priority: 3 },

  // Coût -3 : Généraux
  "aAdv000000000029": { name: "Taille imposante", cost: -3, category: "Général",
    effectText: "Mesure dans les 2M, point de vie augmenter de 10",
    changes: [{ key: "system.pv.max", mode: 2, value: 10 }],
    type: "mechanical", priority: 1, existing: true },
  
  "aAdv000000000030": { name: "Dieu de l'esquive", cost: -3, category: "Général",
    effectText: "L'esquive est un art que vous maitrisez, vous n'etes pas limité dans votre nombre d'esquive",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000031": { name: "Dieu du stade", cost: -3, category: "Général",
    effectText: "Vos capacités athétiques sont un atout majeur, vous ne fatiguez pas si facilement",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000032": { name: "Dieu de la guerre", cost: -3, category: "Général",
    effectText: "Si vous choisissez d'attaquer une seconde fois, aucun malus ne vous sera ajouter",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000033": { name: "Rageux", cost: -3, category: "Général",
    effectText: "Sous l'effet de la rage, vos coups font plus mal mais vous avez tendance a voir rouge",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000034": { name: "Faveur ++", cost: -3, category: "Général",
    effectText: "Un haut membre vous dois une faveure (au choix)",
    changes: [], type: "passive", priority: 3 },

  // Coût -3 : Auras Divines (Effets sur équipe - nécessitent macros)
  "aAdv000000000037": { name: "Aura de Zeus", cost: -3, category: "Aura", devotion: "Zeus",
    effectText: "Renforce les jets de Force de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000041": { name: "Aura d'Héra", cost: -3, category: "Aura", devotion: "Hera",
    effectText: "Renforce les jets d'Astuce de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000045": { name: "Aura de Poséidon", cost: -3, category: "Aura", devotion: "Poseïdon",
    effectText: "Renforce les jets de Constitution de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000049": { name: "Aura d'Athéna", cost: -3, category: "Aura", devotion: "Athéna",
    effectText: "Renforce les jets de Force de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000053": { name: "Aura d'Arès", cost: -3, category: "Aura", devotion: "Arès",
    effectText: "Renforce les jets de Force de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000057": { name: "Aura de Démeter", cost: -3, category: "Aura", devotion: "Demeter",
    effectText: "Renforce les jets de Constitution de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000061": { name: "Aura d'Apollon", cost: -3, category: "Aura", devotion: "Apollon",
    effectText: "Renforce les jets de Astuce de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000065": { name: "Aura d'Artémis", cost: -3, category: "Aura", devotion: "Artémis",
    effectText: "Renforce les jets de Dexterité de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000069": { name: "Aura d'Héphaïstos", cost: -3, category: "Aura", devotion: "Héphaïstos",
    effectText: "Renforce les jets de Force de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000073": { name: "Aura d'Aphrodite", cost: -3, category: "Aura", devotion: "Aphrodite",
    effectText: "Renforce les jets de Charisme de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000077": { name: "Aura d'Hermes", cost: -3, category: "Aura", devotion: "Hermes",
    effectText: "Renforce les jets de Dextérité de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000081": { name: "Aura de Dionysos", cost: -3, category: "Aura", devotion: "Dionysos",
    effectText: "Renforce les jets de Charisme de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000085": { name: "Aura d'Hestia", cost: -3, category: "Aura", devotion: "Hestia",
    effectText: "Renforce les jets de Charisme de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000089": { name: "Aura d'Hécate", cost: -3, category: "Aura", devotion: "Hécate",
    effectText: "Renforce les jets de Astuce de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },
  
  "aAdv000000000093": { name: "Aura d'Hadès", cost: -3, category: "Aura", devotion: "Hadès",
    effectText: "Renforce les jets de Constitution de l'équipe avec +2",
    changes: [], type: "team", priority: 0 },

  // Coût -5 : Ultimes
  "aAdv000000000038": { name: "Sang de Zeus", cost: -5, category: "Utile", devotion: "Zeus",
    effectText: "Extra Life",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000042": { name: "Faveur de la Dame", cost: -5, category: "Utile", devotion: "Hera",
    effectText: "Chanceux 3 relance de Jet",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000046": { name: "Paume de Poséidon", cost: -5, category: "Utile", devotion: "Poseïdon",
    effectText: "Offre un Bateau Magique",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000050": { name: "Esprit d'Athéna", cost: -5, category: "Utile", devotion: "Athéna",
    effectText: "Athéna elle même vous préviens lorsque vous faites le mauvais choix",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000054": { name: "Armure d'Arès", cost: -5, category: "Utile", devotion: "Arès",
    effectText: "Frénesie apres deux kills qui double les PV temporaire",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000058": { name: "Blé de Déméter", cost: -5, category: "Utile", devotion: "Demeter",
    effectText: "Permet de régénerer 3 fois plus de Pv en mangeant.",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000062": { name: "Œil d'Apollon", cost: -5, category: "Utile", devotion: "Apollon",
    effectText: "Oracle (vision dans le sommeil)",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000066": { name: "Compagnon d'Artémis", cost: -5, category: "Utile", devotion: "Artémis",
    effectText: "Animal magique",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000070": { name: "Yeux d'Héphaïstos", cost: -5, category: "Utile", devotion: "Héphaïstos",
    effectText: "Permet de détécter la magie et les enchantements",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000074": { name: "Murmure d'Aphrodite", cost: -5, category: "Utile", devotion: "Aphrodite",
    effectText: "Permet d'Obtenir de sombre secrets sur une personne connus",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000078": { name: "Message d'Hermes", cost: -5, category: "Utile", devotion: "Hermes",
    effectText: "Permet de transmettre des messages court et simple à des alliés",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000082": { name: "Amphore de Dionysos", cost: -5, category: "Utile", devotion: "Dionysos",
    effectText: "Permet de récuperer tout ces PV avec de l'alcool/ 1j",
    changes: [], type: "complex", priority: 2 },
  
  "aAdv000000000086": { name: "Bûcher d'Hestia", cost: -5, category: "Utile", devotion: "Hestia",
    effectText: "Permet de creer un feu qui apporte protection et comfort",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000090": { name: "Lune d'Hécate", cost: -5, category: "Utile", devotion: "Hécate",
    effectText: "Permet un rituel par nuit",
    changes: [], type: "passive", priority: 3 },
  
  "aAdv000000000094": { name: "Peau d'Hadès", cost: -5, category: "Utile", devotion: "Hadès",
    effectText: "Multiplie les PV par deux",
    changes: [], type: "complex", priority: 2 }
};

// Mapping des clés système pour vérification
const VALID_SYSTEM_KEYS = [
  // Caracteristiques
  "system.abilities.for.value", "system.abilities.for.mod",
  "system.abilities.dex.value", "system.abilities.dex.mod",
  "system.abilities.con.value", "system.abilities.con.mod",
  "system.abilities.int.value", "system.abilities.int.mod",
  "system.abilities.ast.value", "system.abilities.ast.mod",
  "system.abilities.cha.value", "system.abilities.cha.mod",
  
  // Compétences (toutes les compétences du système)
  "system.skills.combatMainNue.bonus", "system.skills.armeBlanche.bonus",
  "system.skills.armeDeJet.bonus", "system.skills.levage.bonus",
  "system.skills.parade.bonus", "system.skills.armeExotique.bonus",
  "system.skills.combatDeuxMains.bonus", "system.skills.artisanatFor.bonus",
  "system.skills.esquive.bonus", "system.skills.armeADistance.bonus",
  "system.skills.escamotage.bonus", "system.skills.acrobatie.bonus",
  "system.skills.discretion.bonus", "system.skills.dressage.bonus",
  "system.skills.jeux.bonus", "system.skills.artisanatDex.bonus",
  "system.skills.resistancePoisons.bonus", "system.skills.resistanceDouleur.bonus",
  "system.skills.athletisme.bonus", "system.skills.equitation.bonus",
  "system.skills.natation.bonus", "system.skills.vigueur.bonus",
  "system.skills.survie.bonus", "system.skills.culture.bonus",
  "system.skills.politique.bonus", "system.skills.nature.bonus",
  "system.skills.histoire.bonus", "system.skills.mythologie.bonus",
  "system.skills.tactique.bonus", "system.skills.geographie.bonus",
  "system.skills.etiquette.bonus", "system.skills.premierSoin.bonus",
  "system.skills.investigation.bonus", "system.skills.mysticisme.bonus",
  "system.skills.navigation.bonus", "system.skills.linguistique.bonus",
  "system.skills.vigilance.bonus", "system.skills.empathie.bonus",
  "system.skills.perception.bonus", "system.skills.intimidation.bonus",
  "system.skills.dissimulation.bonus", "system.skills.commandement.bonus",
  "system.skills.seduction.bonus", "system.skills.baratin.bonus",
  "system.skills.psychologie.bonus", "system.skills.marchandage.bonus",
  "system.skills.representation.bonus",
  
  // Sauvegardes
  "system.saves.reflexes.base", "system.saves.reflexes.temp",
  "system.saves.robustesse.base", "system.saves.robustesse.temp",
  "system.saves.volonte.base", "system.saves.volonte.temp",
  
  // Combat
  "system.ca.base", "system.ca.armure", "system.ca.bouclier",
  "system.ca.bonusVigueur", "system.ca.temp",
  "system.attackBonuses.mainNue.bonus", "system.attackBonuses.armeBlanche.bonus",
  "system.attackBonuses.armeDeJet.bonus", "system.attackBonuses.armeExotique.bonus",
  "system.attackBonuses.armeADistance.bonus",
  
  // PV/PM
  "system.pv.value", "system.pv.max", "system.pm.value", "system.pm.max",
  
  // Autres
  "system.initiative"
];

const VALID_MODES = [0, 1, 2, 3, 4, 5]; // Add, Multiply, Override, etc.

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Génère un ID unique pour un ActiveEffect
 */
function generateEffectId(itemId, effectName) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `effect-${itemId.replace('aAdv', '')}-${effectName.replace(/[\s'\x80-\xff]/g, '-').toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Valide une clé système
 */
function isValidSystemKey(key) {
  return VALID_SYSTEM_KEYS.includes(key);
}

/**
 * Valide un mode
 */
function isValidMode(mode) {
  return VALID_MODES.includes(mode);
}

/**
 * Crée un ActiveEffect
 */
function createActiveEffect(name, changes, img = "icons/svg/aura.svg") {
  return {
    _id: generateEffectId("custom", name),
    name: name,
    img: img,
    changes: changes,
    disabled: false,
    transfer: true,
    duration: {
      startTime: null,
      seconds: null,
      rounds: null,
      turns: null
    },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  };
}

/**
 * Affiche un avantage de manière formatée
 */
function displayAdvantage(id, adv, index) {
  const statusIcons = {
    mechanical: '✨',
    passive: 'ℹ️ ',
    complex: '⚠️ ',
    team: '🔄 '
  };
  
  const priorityLabels = {
    0: 'Low',
    1: 'High',
    2: 'Medium',
    3: 'Never'
  };
  
  const icon = statusIcons[adv.type] || '❓';
  const priority = priorityLabels[adv.priority] || 'Unknown';
  const existing = adv.existing ? ' [✅ EXISTE]' : '';
  const costColor = adv.cost <= -3 ? '\x1b[31m' : adv.cost <= -2 ? '\x1b[33m' : '\x1b[32m';
  const resetColor = '\x1b[0m';
  
  let line = `${index.toString().padStart(3)}. [${id}] ${icon} ${costColor}${adv.name.padEnd(30)}${resetColor} (${adv.cost < 0 ? adv.cost : '0'}) ${adv.category.padEnd(10)}`;
  
  if (adv.devotion) {
    line += ` [${adv.devotion.padEnd(10)}]`;
  }
  
  line += existing;
  
  if (adv.type === 'mechanical' && adv.changes && adv.changes.length > 0) {
    line += ` \n    Changes: ${adv.changes.map(c => `+${c.value} ${c.key}`).join(', ')}`;
  }
  
  return line;
}

// ============================================================================
// FONCTIONS DE MODIFICATION
// ============================================================================

/**
 * Ajoute un effet à un avantage
 */
async function addEffectToAdvantage(db, itemId, effectData) {
  const value = await db.get(itemId);
  if (!value) {
    throw new Error(`Avantage ${itemId} non trouvé`);
  }
  
  const item = JSON.parse(value);
  
  // Vérifier que c'est bien un avantage
  if (item.type !== 'advantage') {
    throw new Error(`L'item ${itemId} n'est pas un avantage`);
  }
  
  // Vérifier que l'effet n'existe pas déjà
  if (item.effects && item.effects.some(e => e.name === effectData.name)) {
    return { success: false, message: `Effet "${effectData.name}" déjà présent` };
  }
  
  // Créer le nouvel effet
  const newEffect = createActiveEffect(effectData.name, effectData.changes);
  
  // Ajouter à l'avantage
  item.effects = item.effects || [];
  item.effects.push(newEffect);
  
  // Sauvegarder
  await db.put(itemId, JSON.stringify(item));
  
  return { success: true, message: `Effet ajouté à ${item.name}` };
}

/**
 * Retire un effet d'un avantage
 */
async function removeEffectFromAdvantage(db, itemId, effectName) {
  const value = await db.get(itemId);
  if (!value) {
    throw new Error(`Avantage ${itemId} non trouvé`);
  }
  
  const item = JSON.parse(value);
  
  if (item.type !== 'advantage') {
    throw new Error(`L'item ${itemId} n'est pas un avantage`);
  }
  
  if (!item.effects || item.effects.length === 0) {
    return { success: false, message: `Aucun effet à retirer` };
  }
  
  const initialCount = item.effects.length;
  item.effects = item.effects.filter(e => e.name !== effectName);
  
  if (item.effects.length === initialCount) {
    return { success: false, message: `Effet "${effectName}" non trouvé` };
  }
  
  await db.put(itemId, JSON.stringify(item));
  
  return { success: true, message: `Effet "${effectName}" retiré` };
}

/**
 * Retire tous les effets d'un avantage
 */
async function clearEffectsFromAdvantage(db, itemId) {
  const value = await db.get(itemId);
  if (!value) {
    throw new Error(`Avantage ${itemId} non trouvé`);
  }
  
  const item = JSON.parse(value);
  
  if (item.type !== 'advantage') {
    throw new Error(`L'item ${itemId} n'est pas un avantage`);
  }
  
  const effectsCount = item.effects ? item.effects.length : 0;
  
  if (effectsCount === 0) {
    return { success: false, message: `Aucun effet à retirer` };
  }
  
  item.effects = [];
  await db.put(itemId, JSON.stringify(item));
  
  return { success: true, message: `${effectsCount} effets retirés` };
}

/**
 * Ajoute un effet personnalisé
 */
async function addCustomEffect(db, itemId, effectName, changes) {
  // Valider les changements
  for (const change of changes) {
    if (!isValidSystemKey(change.key)) {
      throw new Error(`Clé système invalide: ${change.key}`);
    }
    if (!isValidMode(change.mode)) {
      throw new Error(`Mode invalide: ${change.mode}`);
    }
  }
  
  const effectData = { name: effectName, changes: changes };
  return addEffectToAdvantage(db, itemId, effectData);
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Liste tous les avantages
 */
async function listAllAdvantages(db, filterType = null) {
  console.log('\n' + '='.repeat(100));
  console.log('📋 LISTE DE TOUS LES AVANTAGES');
  console.log('='.repeat(100));
  
  const categories = {};
  let totalCount = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;
    
    try {
      const item = JSON.parse(value);
      
      if (item.type === 'advantage') {
        totalCount++;
        const category = item.folder || 'Non classé';
        
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ key, item });
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
  }
  
  // Afficher par catégorie
  for (const [category, items] of Object.entries(categories)) {
    if (filterType && !category.includes(filterType)) continue;
    
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`📁 ${category} (${items.length} avantages)`);
    console.log('─'.repeat(100));
    
    items.sort((a, b) => a.item.name.localeCompare(b.item.name));
    
    items.forEach((entry, index) => {
      const item = entry.item;
      const hasEffects = item.effects && item.effects.length > 0;
      const effectsCount = hasEffects ? item.effects.length : 0;
      
      console.log(`${index + 1}. [${entry.key}] ${item.name.padEnd(35)} ` +
        `(Coût: ${item.system?.cout || '?'}) ` +
        `${hasEffects ? '\x1b[32m✅ ' + effectsCount + ' effet(s)\x1b[0m' : '\x1b[33m❌ Aucun effet\x1b[0m'}`);
    });
  }
  
  console.log('\n' + '='.repeat(100));
  console.log(`📊 Total: ${totalCount} avantages`);
  console.log('='.repeat(100) + '\n');
}

/**
 * Liste les avantages avec/sans effets
 */
async function listByEffectStatus(db, hasEffects) {
  console.log('\n' + '='.repeat(100));
  console.log(hasEffects ? '✅ AVANTAGES AVEC EFFETS' : '❌ AVANTAGES SANS EFFETS');
  console.log('='.repeat(100) + '\n');
  
  let count = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;
    
    try {
      const item = JSON.parse(value);
      
      if (item.type === 'advantage') {
        const itemHasEffects = item.effects && item.effects.length > 0;
        
        if (itemHasEffects === hasEffects) {
          count++;
          const info = ALL_ADVANTAGES[key];
          const cost = item.system?.cout || '?';
          
          console.log(`${count}. [${key}] ${item.name.padEnd(35)} ` +
            `(Coût: ${cost < 0 ? cost : '0'}) ` +
            `${item.folder || 'Non classé'}`);
          
          if (itemHasEffects) {
            console.log(`   Effets: ${item.effects.map(e => e.name).join(', ')}`);
          }
        }
      }
    } catch (e) {
      // Ignorer
    }
  }
  
  console.log('\n' + '─'.repeat(100));
  console.log(`Total: ${count} avantages`);
  console.log('='.repeat(100) + '\n');
}

/**
 * Ajoute les effets manquants selon le mapping
 */
async function addMissingEffects(db, priority = 1) {
  console.log('\n' + '='.repeat(100));
  console.log('✨ AJOUT DES EFFETS MANQUANTS');
  console.log('='.repeat(100) + '\n');
  
  const results = {
    added: [],
    skipped: [],
    errors: []
  };
  
  // Filtrer les avantages à traiter
  const toProcess = Object.entries(ALL_ADVANTAGES).filter(([id, adv]) => {
    return adv.priority <= priority && 
           adv.type === 'mechanical' && 
           adv.changes && adv.changes.length > 0;
  });
  
  console.log(`📊 Traitement de ${toProcess.length} avantages avec priorité <= ${priority}\n`);
  
  for (const [id, adv] of toProcess) {
    try {
      // Vérifier si l'avantage existe dans la DB
      const value = await db.get(id);
      if (!value) {
        results.errors.push({ id, name: adv.name, error: 'Non trouvé dans la base' });
        continue;
      }
      
      const item = JSON.parse(value);
      
      if (item.type !== 'advantage') {
        results.skipped.push({ id, name: adv.name, reason: 'Non un avantage' });
        continue;
      }
      
      // Vérifier si l'effet existe déjà
      const hasSimilarEffect = item.effects && 
        item.effects.some(eff => eff.name === adv.name);
      
      if (hasSimilarEffect) {
        results.skipped.push({ id, name: adv.name, reason: 'Effet déjà présent' });
        console.log(`⏭️  [${id}] ${adv.name} - Effet déjà présent`);
        continue;
      }
      
      // Ajouter l'effet
      const result = await addEffectToAdvantage(db, id, adv);
      
      if (result.success) {
        results.added.push({ id, name: adv.name, message: result.message });
        console.log(`✅ [${id}] ${adv.name}`);
      } else {
        results.skipped.push({ id, name: adv.name, reason: result.message });
        console.log(`⏭️  [${id}] ${adv.name} - ${result.message}`);
      }
    } catch (error) {
      results.errors.push({ id, name: adv.name, error: error.message });
      console.log(`❌ [${id}] ${adv.name} - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Mode interactif
 */
async function interactiveMode(db) {
  console.log('\n' + '='.repeat(100));
  console.log('🎮 MODE INTERACTIF - Gestion des effets des avantages');
  console.log('='.repeat(100) + '\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  askQuestion: {
    console.log('\nChoisissez une action:');
    console.log('1. Lister tous les avantages');
    console.log('2. Lister les avantages AVEC effets');
    console.log('3. Lister les avantages SANS effets');
    console.log('4. Ajouter des effets manquantes (selon le mapping)');
    console.log('5. Ajouter un effet personnalisé à un avantage');
    console.log('6. Retirer un effet d\'un avantage');
    console.log('7. Retirer TOUS les effets d\'un avantage');
    console.log('8. Rechercher un avantage par nom');
    console.log('9. Quitter');
    console.log('');
    
    rl.question('Votre choix (1-9): ', async (choice) => {
      switch (choice) {
        case '1':
          await listAllAdvantages(db);
          break;
        case '2':
          await listByEffectStatus(db, true);
          break;
        case '3':
          await listByEffectStatus(db, false);
          break;
        case '4':
          rl.question('Priorité maximale (1=Haute, 2=Moyenne, 3=Basse): ', async (priority) => {
            const results = await addMissingEffects(db, parseInt(priority) || 1);
            console.log('\n--- Résumé ---');
            console.log(`✅ Ajoutés: ${results.added.length}`);
            console.log(`⏭️  Ignorés: ${results.skipped.length}`);
            console.log(`❌ Erreurs: ${results.errors.length}`);
          });
          break;
        case '5':
          rl.question('ID de l\'avantage: ', async (itemId) => {
            rl.question('Nom de l\'effet: ', async (effectName) => {
              rl.question('Modifications (format: key:mode:value, multiple séparés par ;): ', async (changesInput) => {
                try {
                  const changes = changesInput.split(';').map(c => {
                    const [key, mode, value] = c.split(':');
                    return {
                      key: key.trim(),
                      mode: parseInt(mode.trim()) || 2,
                      value: parseFloat(value.trim()) || 0
                    };
                  });
                  
                  const result = await addCustomEffect(db, itemId, effectName, changes);
                  if (result.success) {
                    console.log(`✅ ${result.message}`);
                  } else {
                    console.log(`❌ ${result.message}`);
                  }
                } catch (e) {
                  console.log(`❌ Erreur: ${e.message}`);
                }
              });
            });
          });
          break;
        case '6':
          rl.question('ID de l\'avantage: ', async (itemId) => {
            rl.question('Nom de l\'effet à retirer: ', async (effectName) => {
              try {
                const result = await removeEffectFromAdvantage(db, itemId, effectName);
                if (result.success) {
                  console.log(`✅ ${result.message}`);
                } else {
                  console.log(`❌ ${result.message}`);
                }
              } catch (e) {
                console.log(`❌ Erreur: ${e.message}`);
              }
            });
          });
          break;
        case '7':
          rl.question('ID de l\'avantage: ', async (itemId) => {
            try {
              const result = await clearEffectsFromAdvantage(db, itemId);
              if (result.success) {
                console.log(`✅ ${result.message}`);
              } else {
                console.log(`❌ ${result.message}`);
              }
            } catch (e) {
              console.log(`❌ Erreur: ${e.message}`);
            }
          });
          break;
        case '8':
          rl.question('Nom ou partie du nom: ', async (searchTerm) => {
            const matches = Object.entries(ALL_ADVANTAGES).filter(([id, adv]) => 
              adv.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            console.log(`\n🔍 Résultat pour "${searchTerm}" (${matches.length} trouvé(s)):`);
            matches.forEach(([id, adv], i) => {
              console.log(`${i + 1}. [${id}] ${adv.name} (Coût: ${adv.cost}) - ${adv.category} ${adv.devotion ? '[' + adv.devotion + ']' : ''}`);
            });
          });
          break;
        case '9':
          rl.close();
          console.log('\nAu revoir!\n');
          return;
        default:
          console.log('Choix invalide. Réessayez.');
      }
      
      setTimeout(askQuestion, 100);
    });
  }
}

// ============================================================================
// SCRIPT PRINCIPAL
// ============================================================================

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('  📦 ANTIQUE - Gestion des ActiveEffects des Avantages (v2.0)');
  console.log('═'.repeat(80));
  console.log('  Auteur: Mistral Vibe | Pour Foundry VTT Système Antique');
  console.log('═'.repeat(80) + '\n');
  
  // Vérifier les arguments
  const args = process.argv.slice(2);
  let mode = args[0];
  const dbPath = args[1] || COMPENDIUM_PATH;
  
  if (!mode) {
    console.log('Utilisation:');
    console.log('  node _add-advantages-effects-V2.js <mode> [chemin]');
    console.log('');
    console.log('Modes disponibles:');
    console.log('  list              - Lister tous les avantages');
    console.log('  list-with        - Lister les avantages AVEC effets');
    console.log('  list-without     - Lister les avantages SANS effets');
    console.log('  add              - Ajouter les effets manquants');
    console.log('  interactive      - Mode interactif (par défaut)');
    console.log('  help             - Afficher cette aide');
    console.log('');
    console.log('Exemples:');
    console.log('  node _add-advantages-effects-V2.js list');
    console.log('  node _add-advantages-effects-V2.js add');
    console.log('  node _add-advantages-effects-V2.js interactive');
    console.log('');
    
    mode = MODES.INTERACTIVE;
  }
  
  if (mode === 'help' || mode === '-h' || mode === '--help') {
    console.log('\nAide:');
    console.log('  Ce script permet de gérer les ActiveEffects des avantages dans le compendium.');
    console.log('  Il nécessite Node.js v16+ et le package classic-level.');
    console.log('');
    console.log('Installation des dépendances:');
    console.log('  npm install classic-level');
    console.log('');
    return;
  }
  
  // Vérifier que la base existe
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Erreur: Le compendium n'existe pas à: ${dbPath}`);
    console.error(`   Vérifiez que le chemin est correct.`);
    process.exit(1);
  }
  
  // Ouvrir la base de données
  const db = new (require('classic-level')).ClassicLevel(dbPath, {
    keyEncoding: 'utf8',
    valueEncoding: 'utf8'
  });
  
  try {
    switch (mode) {
      case MODES.LIST:
        await listAllAdvantages(db);
        break;
      case 'list-with':
        await listByEffectStatus(db, true);
        break;
      case 'list-without':
        await listByEffectStatus(db, false);
        break;
      case MODES.ADD:
        await addMissingEffects(db, 1);
        break;
      case MODES.INTERACTIVE:
      default:
        await interactiveMode(db);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  N\'OUBLIEZ PAS:');
    console.log('='.repeat(80));
    console.log('1. Exécuter: fvtt package clear');
    console.log('2. Redémarrer Foundry VTT');
    console.log('3. Vérifier les modifications dans le compendium');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await db.close();
  }
}

// Démarrer
main();
