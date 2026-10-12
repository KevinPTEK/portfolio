// Les courbes de vitesse des animations écrites à la main (défilement, vol
// de l'avatar, brouillard), en fonctions pures : t de 0 à 1 → avancée de 0 à 1

/**
 * Quintique : démarre doucement, file, se pose (défilement, charte)
 *
 * @param {number} t - le temps écoulé, de 0 à 1
 * @returns {number} l'avancée du trajet, de 0 à 1
 */
export function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2
}
