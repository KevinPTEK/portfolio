/**
 * L'arrivée d'un projet par-dessus le précédent, de 0 à 1 (§ 7.10) : de
 * « son repère touche le bas de l'écran » (0) à « son repère atteint le
 * haut » (1).
 *
 * @param {number} markerTop - le haut du repère, en pixels depuis le haut de l'écran
 * @param {number} viewportHeight - la hauteur de l'écran, en pixels
 * @returns {number} l'arrivée, de 0 à 1 (0 pour un écran sans hauteur)
 *
 * @example
 * arrivalOf(600, 1000) // 0.4
 */
export function arrivalOf(markerTop, viewportHeight) {
  // un cadre masqué n'a pas de hauteur : sans ce garde, NaN
  if (viewportHeight <= 0) return 0
  return Math.min(1, Math.max(0, 1 - markerTop / viewportHeight))
}
