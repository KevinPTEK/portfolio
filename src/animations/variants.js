// Les mouvements partagés. La courbe et la durée des apparitions recopient
// les jetons de _tokens.scss (variants.test.js vérifie qu'ils restent d'accord).

export const EASE_OUT = [0.2, 0.8, 0.2, 1] // $ease-out
export const DURATION_SLOW = 0.9 // $duration-slow : apparitions au défilement
export const STAGGER = 0.12 // entre deux lignes

// fondu + montée de 24 px ; sous « réduire les animations », Motion garde le
// fondu seul
export const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_SLOW, ease: EASE_OUT },
  },
}

// flou → net et montée de 14 px, sans opacité : l'accueil est peint dès la
// première image (LCP)
export const unblur = {
  hidden: { filter: 'blur(14px)', y: 14 },
  visible: {
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1.1, ease: EASE_OUT },
    // un filter resté posé, même nul, change le repère des éléments fixes
    transitionEnd: { filter: 'none' },
  },
}

// un parent dont les enfants arrivent l'un après l'autre
export function stagger(staggerChildren = STAGGER, delayChildren = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
  }
}

// L'entrée de l'accueil, 150 ms après l'intro : le bloc identité (et l'avatar
// volant), puis les lignes du menu
export const ENTRANCE = stagger(STAGGER, 0.15)
