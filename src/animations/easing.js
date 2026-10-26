// Les courbes des animations écrites à la main : t de 0 à 1 → avancée de 0 à 1

/**
 * Quintique : démarre doucement, file, se pose (défilement)
 *
 * @param {number} t - le temps écoulé, de 0 à 1
 * @returns {number} l'avancée du trajet, de 0 à 1
 */
export function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2
}

/**
 * Quadratique : accélère puis freine (brouillard de l'intro)
 *
 * @param {number} t - le temps écoulé, de 0 à 1
 * @returns {number} l'avancée du trajet, de 0 à 1
 */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/**
 * Quadratique qui freine : rapide au départ, posée à l'arrivée (vol de
 * l'avatar)
 *
 * @param {number} t - le temps écoulé, de 0 à 1
 * @returns {number} l'avancée du trajet, de 0 à 1
 */
export function easeOutQuad(t) {
  return 1 - (1 - t) ** 2
}
