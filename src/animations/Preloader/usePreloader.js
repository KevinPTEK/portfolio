import { useEffect, useState } from 'react'
import { REDUCED_MOTION } from '../../hooks/useMediaQuery.js'

// Le calendrier de l'intro, en secondes (maquette v5, § 7.4)
export const INTRO = {
  open: 2.45, // le sceau est dessiné, le halo allumé : on ouvre
  ready: 0.45, // après l'ouverture : clics et défilement rendus
  lift: 3.2, // la lumière puis la brume, jusqu'à la page nue
  rush: 0.5, // la fin en accéléré, au premier geste du visiteur
}
export const PLAYED_KEY = 'kr-intro-played'
const GESTURES = ['keydown', 'pointerdown', 'wheel', 'touchstart']
const MODIFIERS = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']
const ORDER = ['drawing', 'opening', 'ready', 'done']

// l'intro ne recule jamais : un minuteur dû et un geste dans la même image
// ne la ramènent pas en arrière (revue)
const toward = (next) => (current) =>
  ORDER.indexOf(next) > ORDER.indexOf(current) ? next : current

// Maj seule, ou un raccourci du navigateur (Cmd+Tab, Ctrl+L) : pas un geste
// vers la page (revue)
const isGesture = (event) =>
  event.type !== 'keydown' ||
  !(
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    MODIFIERS.includes(event.key)
  )

/** L'intro joue-t-elle ? Une fois par session, jamais sous « réduire les animations », ni sur un lien vers une pièce */
export function shouldPlayIntro() {
  if (window.matchMedia(REDUCED_MOTION).matches) return false
  // un lien vers une pièce (/#work) : le visiteur veut la voir tout de suite
  if (window.location.hash) return false
  // ouverte dans un onglet en arrière-plan : personne ne la verrait (et le
  // brouillard, suspendu, se désynchroniserait du calendrier — revue)
  if (document.visibilityState === 'hidden') return false
  try {
    return !window.sessionStorage.getItem(PLAYED_KEY)
  } catch {
    // stockage refusé (navigation privée, réglages) : on joue, sans retenir
    return true
  }
}

/**
 * La machine à états de l'intro (§ 7.4) : drawing → opening → ready → done.
 * Au premier geste du visiteur, la fin se joue en accéléré (rushed).
 * À appeler une fois, dans App.
 *
 * @returns {{ phase: 'drawing' | 'opening' | 'ready' | 'done', rushed: boolean }}
 *
 * @example
 * const intro = usePreloader()
 * <Preloader phase={intro.phase} rushed={intro.rushed} />
 */
export function usePreloader() {
  const [phase, setPhase] = useState(() =>
    shouldPlayIntro() ? 'drawing' : 'done',
  )
  const [rushed, setRushed] = useState(false)
  const playing = phase !== 'done'

  // retenir qu'elle a été jouée, dès qu'elle commence
  useEffect(() => {
    if (!playing) return
    try {
      window.sessionStorage.setItem(PLAYED_KEY, '1')
    } catch {
      // stockage refusé : elle rejouera à la prochaine visite
    }
  }, [playing])

  // le calendrier normal ; un geste l'interrompt…
  useEffect(() => {
    if (!playing || rushed) return
    const at = (seconds, next) =>
      setTimeout(() => setPhase(toward(next)), seconds * 1000)
    const timers = [
      at(INTRO.open, 'opening'),
      at(INTRO.open + INTRO.ready, 'ready'),
    ]
    return () => timers.forEach(clearTimeout)
  }, [playing, rushed])

  // …mais pas sa fin : le geste ne peut que l'avancer (revue : un geste dans
  // la dernière demi-seconde la retardait)
  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(
      () => setPhase('done'),
      (INTRO.open + INTRO.lift) * 1000,
    )
    return () => clearTimeout(timer)
  }, [playing])

  // le premier geste : la fin en accéléré
  useEffect(() => {
    if (!playing || rushed) return
    function rush(event) {
      if (!isGesture(event)) return
      setRushed(true)
      setPhase(toward('ready'))
    }
    GESTURES.forEach((type) =>
      window.addEventListener(type, rush, { passive: true }),
    )
    return () =>
      GESTURES.forEach((type) => window.removeEventListener(type, rush))
  }, [playing, rushed])

  useEffect(() => {
    if (!rushed) return
    const timer = setTimeout(() => setPhase('done'), INTRO.rush * 1000)
    return () => clearTimeout(timer)
  }, [rushed])

  return { phase, rushed }
}
