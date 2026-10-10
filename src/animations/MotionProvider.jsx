import { LazyMotion, MotionConfig } from 'motion/react'
import { loadMotionFeatures } from './loadMotionFeatures.js'

/**
 * Le cadre de toutes les animations du site (§ 7.1), autour d'App.
 * - « Réduire les animations » : Motion coupe les déplacements (transform,
 *   mise en page) et garde les fondus. Il ne coupe PAS les flous (filter) :
 *   un composant qui floute s'en charge lui-même (l'accueil, § 7.4).
 * - Le moteur arrive après le premier affichage ; strict : m.div seulement,
 *   motion.div embarquerait tout le moteur.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 *
 * @example
 * <MotionProvider><App /></MotionProvider>
 */
export function MotionProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
