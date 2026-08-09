// NE PLUS EXECUTER SANS RELIRE : ce script avait ecrase (12/05/2026) le fix du
// 26/04/2026 en pointant l'ActiveEffect vers "system.damage", un champ qui n'existe
// nulle part sur l'Actor (donc sans aucun effet en jeu) -- voir _migrate-avantages-effects.js
// pour la clef correcte. Corrige ici (08/08/2026) pour ecrire "system.attackBonuses.
// armeBlanche.damageBonus" (nouveau champ, voir actor-character.mjs) si jamais ce
// script est relance par erreur.
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier
const dbPath = path.join(__dirname, 'avantages.db');
const data = fs.readFileSync(dbPath, 'utf-8');

// Séparer les entrées (format JSON Lines)
const lines = data.split('\n').filter(line => line.trim() !== '');

// Trouver et modifier l'entrée "Colère de Zeus"
const updatedLines = lines.map(line => {
  try {
    const entry = JSON.parse(line);
    if (entry._id === 'aAdv000000000035') {
      return JSON.stringify({
        ...entry,
        system: {
          ...entry.system,
          description: `<p><strong>Dévotion :</strong> Zeus</p><p>Dégâts aux corps à corps +3. <em>Appliqué automatiquement à toutes les armes de corps à corps.</em></p>`
        },
        effects: [
          {
            name: "Colère de Zeus (+3 dégâts)",
            icon: "icons/svg/sun.svg",
            transfer: true,
            disabled: false,
            changes: [
              {
                key: "system.attackBonuses.armeBlanche.damageBonus",
                mode: 2,
                value: "3",
                priority: 20
              }
            ],
            _id: "eAdv000000000035_01",
            origin: "aAdv000000000035",
            duration: null
          }
        ]
      });
    }
    return line;
  } catch (e) {
    console.error('Erreur de parsing :', e.message);
    return line;
  }
});

// Reconstruire le fichier
const updatedData = updatedLines.join('\n') + '\n';
fs.writeFileSync(dbPath, updatedData, 'utf-8');

console.log('✅ Entrée "Colère de Zeus" mise à jour avec succès !');
