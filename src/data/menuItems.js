import { pad } from '../utils/pad.js'
import menu from './menu.json'

// les entrées du menu, prêtes à afficher :
// { id: 'about', label: 'À propos', href: '#about', number: '01' }
export const menuItems = menu.map(({ id, label }, index) => ({
  id,
  label,
  href: `#${id}`,
  number: pad(index + 1),
}))

/**
 * L'étiquette d'une pièce du menu : « 01 — À propos ». Un id inconnu lève une
 * erreur qui le nomme.
 *
 * @param {string} id - l'id de la pièce dans menu.json
 * @returns {string}
 */
export function sectionLabel(id) {
  const item = menuItems.find((entry) => entry.id === id)
  if (!item) throw new Error(`menu.json n'a pas d'entrée « ${id} »`)
  return `${item.number} — ${item.label}`
}
