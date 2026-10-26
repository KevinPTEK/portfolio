import { LazyMotion, MotionConfig } from 'motion/react'
import { loadMotionFeatures } from './loadMotionFeatures.js'

/**
 * Le cadre des animations, autour d'App. « Réduire les animations » : Motion
 * coupe les déplacements mais pas les flous (l'accueil s'en charge). Le moteur
 * arrive après le premier affichage ; strict : m.div seulement (motion.div
 * embarquerait tout le moteur).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
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
