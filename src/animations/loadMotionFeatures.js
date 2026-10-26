/**
 * Charge le moteur de Motion (pour LazyMotion). En cas d'échec (onglet ouvert
 * pendant un nouveau déploiement), <html data-motion="off"> : le CSS remet
 * les blocs visibles, et l'erreur reste dans la console.
 *
 * @param {() => Promise<{ default: object }>} [importFeatures] - pour les tests
 * @returns {Promise<object>} les fonctions de domAnimation
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
