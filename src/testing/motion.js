// Simule « réduire les animations » (remis à zéro par vitest.setup.js).
// Attention : Motion ne lit ce réglage qu'une fois par fichier de test ; seul
// useMediaQuery le suit
export function preferReducedMotion() {
  window.happyDOM.settings.device.prefersReducedMotion = 'reduce'
}
