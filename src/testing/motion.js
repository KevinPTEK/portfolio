// Pour les tests seulement : happy-dom sait simuler « réduire les animations »
// (réglage de l'appareil). vitest.setup.js le remet à zéro après chaque test.
// Attention : useMediaQuery relit ce réglage à chaque rendu, mais Motion
// (useReducedMotion, MotionConfig) ne le lit qu'une fois par fichier de test,
// à sa première utilisation — ce réglage-ci ne le pilote donc pas (revue).
export function preferReducedMotion() {
  window.happyDOM.settings.device.prefersReducedMotion = 'reduce'
}
