import { pad } from '../utils/pad.js'
import menu from './menu.json'

// Les entrées du menu, prêtes à afficher, partagées par le menu géant de
// l'accueil, la nav et App (3ᵉ lecture de menu.json, revue du 8 oct.) :
// { id: 'about', label: 'À propos', href: '#about', number: '01' }
export const menuItems = menu.map(({ id, label }, index) => ({
  id,
  label,
  href: `#${id}`,
  number: pad(index + 1),
}))
