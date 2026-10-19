import { useEffect, useLayoutEffect } from 'react'
import { REDUCED_MOTION } from '../hooks/useMediaQuery.js'
import { easeInOutQuint } from './easing.js'
import { scrollAnimation } from './scrollAnimation.js'

// ce qui reprend la main pendant un trajet : un geste du visiteur, ou le
// bouton Retour (popstate : le navigateur restaure sa position, la boucle
// ne doit pas continuer vers l'ancienne cible — revue)
const GESTURES = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'popstate']
// tout lien interne, sauf le lien d'évitement : il reste immédiat (§ 7.6)
const INTERNAL_LINK = 'a[href^="#"]:not(.skip-link)'

/**
 * Durée du trajet : 0,5 s + 0,18 ms par pixel, 1,4 s au plus (charte)
 *
 * @param {number} distance - en pixels (le signe ne compte pas)
 * @returns {number} la durée, en secondes
 */
export function scrollDuration(distance) {
  return Math.min(1.4, 0.5 + Math.abs(distance) * 0.00018)
}

/**
 * Où défiler pour amener la cible en haut de l'écran, sous la barre du haut
 * (scroll-padding-top, § 8). Une pièce collée (sticky) ne dit pas où elle
 * commence — sa position est celle où elle colle : on part alors de son
 * parent, qui suit le flux, et on ajoute la hauteur des éléments d'avant.
 *
 * @param {HTMLElement} target
 * @returns {number} la position de défilement visée, en pixels
 *
 * @example
 * window.scrollTo(0, scrollTargetTop(document.getElementById('skills')))
 */
export function scrollTargetTop(target) {
  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  let top
  if (getComputedStyle(target).position === 'sticky') {
    top = target.parentElement.getBoundingClientRect().top
    for (
      let sibling = target.parentElement.firstElementChild;
      sibling !== target;
      sibling = sibling.nextElementSibling
    ) {
      top += sibling.offsetHeight
    }
  } else {
    top = target.getBoundingClientRect().top
  }
  return top + window.scrollY - padding
}

// la cible d'une adresse « #about », si elle existe
function targetOf(hash) {
  const id = hash.slice(1)
  try {
    return document.getElementById(decodeURIComponent(id))
  } catch {
    // adresse mal formée (« #100% », un lien tronqué) : decodeURIComponent
    // lève une erreur, qui laissait la page blanche (revue)
    return document.getElementById(id)
  }
}

// une vraie arrivée sur la page : au rechargement et au Retour, le navigateur
// restaure lui-même la position où l'on était (sauter à l'ancre l'écrasait)
function isArrival() {
  const [navigation] = performance.getEntriesByType('navigation')
  return !navigation || navigation.type === 'navigate'
}

// le focus suit le lien, comme avec le saut natif (WCAG 2.4.3) : une pièce
// n'est pas focalisable, tabindex="-1" la rend atteignable par le code seulement
function focusTarget(target) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/**
 * Le défilement animé vers les pièces (§ 7.6) : un seul écouteur de clics
 * pour tous les liens internes. Sous « réduire les animations », le
 * navigateur fait son saut natif. Au chargement avec une adresse « #pièce »,
 * saute à la pièce (React affiche la page après la tentative du navigateur).
 * À appeler une fois, dans App.
 *
 * @example
 * export function App() {
 *   useScrollTo()
 *   …
 * }
 */
export function useScrollTo() {
  // lien direct : on saute à la pièce avant le premier affichage
  // (useLayoutEffect : avec useEffect, une image de l'accueil passait d'abord)
  useLayoutEffect(() => {
    const target = targetOf(window.location.hash)
    if (!target || !isArrival()) return
    const jump = () => window.scrollTo(0, scrollTargetTop(target))
    jump()
    focusTarget(target)

    // Les polices arrivent souvent après ce saut : sur mobile, les textes
    // au-dessus de la pièce changent de hauteur, et elle finissait jusqu'à
    // 103 px plus haut (revue générale, mesuré à 375 px). On resaute une fois
    // les polices là — sauf si le visiteur a repris la main entre-temps
    let tookOver = false
    let unmounted = false
    const takeOver = () => (tookOver = true)
    const stopListening = () =>
      GESTURES.forEach((type) => window.removeEventListener(type, takeOver))
    GESTURES.forEach((type) =>
      window.addEventListener(type, takeOver, { passive: true }),
    )
    document.fonts?.ready.then(() => {
      stopListening()
      if (!tookOver && !unmounted) jump()
    })
    return () => {
      unmounted = true
      stopListening()
    }
  }, [])

  useEffect(() => {
    let stop = null // arrête le trajet en cours

    function handleClick(event) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const link = event.target.closest?.(INTERNAL_LINK)
      const target = link && targetOf(link.hash)
      if (!target || window.matchMedia(REDUCED_MOTION).matches) return

      event.preventDefault()
      stop?.()
      focusTarget(target)
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, '', link.hash)
      }

      const from = window.scrollY
      // jamais au-dessus du haut de la page : sous la barre, le haut de
      // <main> donnerait -56, et la fin ralentie du trajet serait coupée
      const to = Math.max(0, scrollTargetTop(target))
      const animation = scrollAnimation(from, to, {
        duration: scrollDuration(to - from),
        ease: easeInOutQuint,
        onUpdate: (y) => window.scrollTo(0, y),
      })

      // le premier geste du visiteur arrête le trajet : il reprend la main.
      // Sauf une touche maintenue : Entrée, qui a déclenché le clic, se répète
      // tant qu'elle n'est pas relâchée (revue)
      function release(gesture) {
        if (gesture?.repeat) return
        animation.stop()
        GESTURES.forEach((type) => window.removeEventListener(type, release))
        // un trajet plus récent garde son propre « stop »
        if (stop === release) stop = null
      }
      GESTURES.forEach((type) =>
        window.addEventListener(type, release, { passive: true }),
      )
      animation.then(release)
      stop = release
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      stop?.()
    }
  }, [])
}
