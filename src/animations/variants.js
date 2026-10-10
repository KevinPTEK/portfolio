// Les mouvements partagés (§ 7.2). La courbe et la durée des apparitions
// recopient les jetons Sass de _tokens.scss — JavaScript ne lit pas le Sass ;
// variants.test.js vérifie que les deux copies restent d'accord. Les autres
// valeurs (1,1 s, 120 ms) viennent de la charte et n'ont pas de jeton.

export const EASE_OUT = [0.2, 0.8, 0.2, 1] // $ease-out
export const DURATION_SLOW = 0.9 // $duration-slow : apparitions au défilement
export const STAGGER = 0.12 // 120 ms entre deux lignes (charte, « Arrivée, suite »)

// fondu + montée de 24 px (Reveal, § 7.3) ; sous « réduire les animations »,
// Motion retire la montée et garde le fondu (§ 7.1)
export const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_SLOW, ease: EASE_OUT },
  },
}

// flou → net et montée de 14 px, SANS opacité : l'accueil doit être peint dès
// la première image, sinon le LCP attendrait la fin de l'intro (§ 7.4)
export const unblur = {
  hidden: { filter: 'blur(14px)', y: 14 },
  visible: {
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1.1, ease: EASE_OUT },
    // net, plus aucun filtre : un filter resté posé, même nul, change le
    // repère des éléments position: fixed qu'il contient
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
