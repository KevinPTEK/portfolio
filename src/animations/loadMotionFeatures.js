/**
 * Charge le moteur de Motion (passé à LazyMotion). S'il ne se charge pas
 * (onglet ouvert pendant un nouveau déploiement : l'ancien fichier n'existe
 * plus), <html data-motion="off"> : le CSS de Reveal remet les blocs visibles
 * (§ 7.1). L'erreur est relancée : elle reste dans la console.
 *
 * @param {() => Promise<{ default: object }>} [importFeatures] - pour les tests
 * @returns {Promise<object>} les fonctions de domAnimation
 *
 * @example
 * <LazyMotion features={loadMotionFeatures} strict>…</LazyMotion>
 */
export function loadMotionFeatures(
  importFeatures = () => import('./motionFeatures.js'),
) {
  return importFeatures()
    .then((module) => module.default)
    .catch((error) => {
      document.documentElement.dataset.motion = 'off'
      throw error
    })
}
