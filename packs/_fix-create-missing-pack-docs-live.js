/**
 * Macro GM : crée directement, via l'API Document Foundry (createDocuments avec
 * keepId, aucune édition LevelDB), les documents qui manquent aux compendiums déjà
 * déployés — corrige le fait que packs/effets.db et packs/equipement.db (sources
 * NDJSON plates) ne sont jamais chargés directement par Foundry : le compendium
 * "Effets" reste vide tant que ses documents n'ont jamais été créés dans le monde,
 * et pareil pour un objet neuf ajouté à un pack déjà déployé (ex. "Rations
 * régénératrices de Déméter", packs/equipement.db).
 *
 * Idempotent : ne crée que ce qui manque réellement (comparé à pack.getIndex()),
 * sûr à relancer plusieurs fois. Garde les mêmes _id que la source, donc tous les
 * liens @UUID déjà écrits dans les descriptions des avantages continuent de
 * fonctionner sans modification.
 *
 * Run : coller dans une macro Script et exécuter en tant que MJ.
 */
const EFFETS = [
  {
    "_id": "eEft000000000001",
    "name": "Cuir de Héros",
    "img": "icons/svg/aura.svg",
    "type": "base",
    "system": {
      "changes": [
        {
          "key": "system.saves.robustesse.bonus",
          "type": "add",
          "value": "2"
        }
      ]
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>La peau tannée par les épreuves du héros encaisse les coups comme un vieux cuir. Résistance physique accrue.</p><p><strong>+2 Robustesse</strong>, tant que cet effet est actif.</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000002",
    "name": "Athlète",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": [
        {
          "key": "system.deplacement",
          "type": "multiply",
          "value": "2"
        }
      ]
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Un corps sculpté par l'entraînement, capable de couvrir de grandes distances sans effort.</p><p><strong>Déplacement ×2</strong>, tant que cet effet est actif.</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000003",
    "name": "Connaissance d'Héphaistos",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": [
        {
          "key": "system.ca.temp",
          "type": "add",
          "value": "-2"
        }
      ]
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>La science des forges d'Héphaïstos permet de repérer la faille d'une armure adverse.</p><p><strong>-2 CA (temporaire)</strong>, tant que cet effet est actif. Glisser directement sur la cible ; désactiver ou supprimer l'effet quand il doit cesser.</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000004",
    "name": "Guerrier Aguerri",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Offre une deuxieme action de combat</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000005",
    "name": "Equilibre félin",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Pas de malus sur terrain difficile</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000006",
    "name": "Fetard",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Pas de malus du à l'alcool/ manque de sommeil</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000007",
    "name": "Bon sens",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Une petite voix dans votre tête vous conseil parfois</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000008",
    "name": "Commercant",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Augmente vos possibilité de commerce (vente et achat)</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000009",
    "name": "Visage passe partout",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Votre visage n'as rien de particulier, on vous oublie facilement</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000010",
    "name": "Sommeil leger",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Vous dormez d'une oreille, avantage en cas de reveil soudain</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000011",
    "name": "Faveur",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Un lambda vous dois une faveur (au choix)</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000012",
    "name": "Respect d'Héra",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hera</p><p>Tu peux percevoir la trahison dans ton entourage</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000013",
    "name": "Branchies de Poséidon",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Poseïdon</p><p>Permet 1d6/lvl de régéneration avec de l'eau</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000014",
    "name": "Rage d'Arès",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Arès</p><p>Permet de faire deux attaques/ tour</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000015",
    "name": "Soin d'Apollon",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Apollon</p><p>Permet de stabiliser un allié 2/j</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000016",
    "name": "Chasse d'Artèmis",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Artèmis</p><p>Chasse assuré</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000017",
    "name": "Beauté d'Aphrodite",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Aphrodite</p><p>Permet de capter l'attention ou la rejeter au combat</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000018",
    "name": "Mains d'Hèrmès",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hermes</p><p>Permet de voler un petit objet avec 1 chance sur 6 d'etre reperer</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000019",
    "name": "Ivresse de Dionysos",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Dionysos</p><p>Permet de renforcer les effets de l'alcool</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000020",
    "name": "Chaleur d'Hestia",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hestia</p><p>Vous inspirez confiance</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000021",
    "name": "Vue d'Hécate",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hécate</p><p>Permet de toujours connaitre la voie à prendre</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000022",
    "name": "Don d'Hadès",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hadès</p><p>Permet de voir et de communiquer avec les morts reçents</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000023",
    "name": "Chrono sens",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Vous savez toujours quand vous etes</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000024",
    "name": "Ami des animaux",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Vous avez grandis avec des animaux ce qui augmente leurs confiance en vous</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000025",
    "name": "Ambidextrie",
    "img": "icons/svg/upgrade.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>Vos deux mains sont majeure, vous n'avez pas de faiblesse ni d'un coté ni de l'autre</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000026",
    "name": "Charme d'Aphrodite",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Aphrodite</p><p>Réduit le jet de touche de l'adversaire de 2</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000027",
    "name": "Casque d'Hadès",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": []
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p><strong>Dévotion :</strong> Hadès</p><p>Permet de disparaitre dans les ombres 2/J</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  },
  {
    "_id": "eEft000000000028",
    "name": "Peau d'Hadès",
    "img": "icons/svg/sun.svg",
    "type": "base",
    "system": {
      "changes": [
        {
          "key": "system.pv.value",
          "type": "multiply",
          "value": "2"
        }
      ]
    },
    "disabled": false,
    "duration": {
      "startTime": null,
      "seconds": null,
      "rounds": null,
      "turns": null
    },
    "description": "<p>La peau du personnage prend la texture grise et coriace des Enfers, encaissant les coups au prix d'une vitalité changée. <strong>PV actuels ×2</strong>, tant que cet effet est actif.</p>",
    "origin": null,
    "tint": "#ffffff",
    "transfer": true,
    "statuses": [],
    "folder": null,
    "sort": 0,
    "flags": {}
  }
];

const EQUIPMENT = [
  {
    "_id": "aEqp000000000051",
    "name": "Rations régénératrices de Déméter",
    "type": "equipment",
    "img": "icons/svg/sun.svg",
    "system": {
      "quantity": 1,
      "description": "<p>Un pain doré et un peu de fruits secs, bénis par Déméter — leur goût rappelle les récoltes les plus généreuses. Consommées, elles rassasient et referment les blessures.</p><p><strong>+10 PV</strong> lorsque consommées.</p>",
      "consumable": true,
      "caBonus": 0,
      "healAmount": 10,
      "linkedSkill": "",
      "skillBonus": 0,
      "slot": "",
      "equipped": false,
      "price": "0 po",
      "apothCategory": "",
      "apothType": "",
      "isIngredientBag": false,
      "gmNotes": ""
    },
    "effects": [],
    "folder": null,
    "sort": 5100000,
    "ownership": {
      "default": 0
    },
    "flags": {}
  }
];

async function syncMissing(packName, docs) {
  const pack = game.packs.get(packName);
  if (!pack) {
    console.warn(`[sync-missing-docs] pack introuvable : ${packName}`);
    return 0;
  }
  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = docs.filter(d => !existingIds.has(d._id));
  if (!missing.length) return 0;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  if (wasLocked) await pack.configure({ locked: true });

  for (const d of missing) console.log(`[sync-missing-docs] "${d.name}" créé dans ${packName}.`);
  return missing.length;
}

const effetsCreated = await syncMissing("antique.effets", EFFETS);
const equipCreated = await syncMissing("antique.equipement", EQUIPMENT);
ui.notifications.info(`${effetsCreated} effet(s) créé(s), ${equipCreated} objet(s) créé(s) dans les compendiums — voir la console pour le détail.`);
