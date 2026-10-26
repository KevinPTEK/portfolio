/**
 * L'arrivée d'un projet par-dessus le précédent : 0 quand son repère touche
 * le bas de l'écran, 1 quand il atteint le haut.
 *
 * @param {number} markerTop - le haut du repère, en pixels depuis le haut de l'écran
 * @param {number} viewportHeight - la hauteur de l'écran, en pixels
 * @returns {number} l'arrivée, de 0 à 1 (0 pour un écran sans hauteur)
 */
export function arrivalOf(markerTop, viewportHeight) {
  // un cadre masqué n'a pas de hauteur (NaN sinon)
  if (viewportHeight <= 0) return 0
  return Math.min(1, Math.max(0, 1 - markerTop / viewportHeight))
}
