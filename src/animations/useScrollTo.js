import { useEffect, useLayoutEffect } from 'react'
import { REDUCED_MOTION } from '../hooks/useMediaQuery.js'
import { easeInOutQuint } from './easing.js'
import { scrollAnimation } from './scrollAnimation.js'

// ce qui rend la main au visiteur pendant un trajet (popstate : le navigateur
// restaure lui-même sa position)
const GESTURES = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'popstate']
// tout lien interne, sauf le lien d'évitement, qui reste immédiat
const INTERNAL_LINK = 'a[href^="#"]:not(.skip-link)'

// écoute ces évènements sur window ; renvoie de quoi arrêter d'écouter
function listen(types, handler) {
  types.forEach((type) =>
    window.addEventListener(type, handler, { passive: true }),
  )
  return () =>
    types.forEach((type) => window.removeEventListener(type, handler))
}

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
 * Où défiler pour amener la cible sous la barre du haut (scroll-padding-top).
 * Une pièce collée (sticky) donne la position où elle colle : on part alors
 * de son parent, et on ajoute la hauteur des éléments d'avant.
 *
 * @param {HTMLElement} target
 * @returns {number} la position de défilement visée, en pixels
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
    // adresse mal formée (« #100% ») : decodeURIComponent lève une erreur
    return document.getElementById(id)
  }
}

// au rechargement et au Retour, le navigateur restaure lui-même la position
function isArrival() {
  const [navigation] = performance.getEntriesByType('navigation')
  return !navigation || navigation.type === 'navigate'
}

// le focus suit le lien, comme avec le saut natif (WCAG 2.4.3)
function focusTarget(target) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/**
 * Le défilement animé vers les pièces : un seul écouteur de clics pour tous
 * les liens internes. Sous « réduire les animations », le saut natif. Au
 * chargement avec une adresse « #pièce », saute à la pièce. À appeler une
 * fois, dans App.
 */
export function useScrollTo() {
  // lien direct : avant le premier affichage, sinon l'accueil passe d'abord
  useLayoutEffect(() => {
    const target = targetOf(window.location.hash)
    if (!target || !isArrival()) return
    const jump = () => window.scrollTo(0, scrollTargetTop(target))
    jump()
    focusTarget(target)

    // les polices arrivent souvent après ce saut et changent la hauteur des
    // textes au-dessus de la pièce : on resaute une fois, sauf si le visiteur
    // a repris la main (un lecteur d'écran clique sans pointerdown)
    if (!document.fonts) return
    let visitorMoved = false
    let unmounted = false
    const stopListening = listen([...GESTURES, 'click'], () => {
      visitorMoved = true
    })
    document.fonts.ready.then(() => {
      stopListening()
      if (!visitorMoved && !unmounted) jump()
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
      // jamais au-dessus du haut de la page : la fin du trajet serait coupée
      const to = Math.max(0, scrollTargetTop(target))
      const animation = scrollAnimation(from, to, {
        duration: scrollDuration(to - from),
        ease: easeInOutQuint,
        onUpdate: (y) => window.scrollTo(0, y),
      })

      // un geste arrête le trajet, sauf la touche Entrée maintenue qui l'a lancé
      function release(gesture) {
        if (gesture?.repeat) return
        animation.stop()
        stopListening()
        // un trajet plus récent garde son propre « stop »
        if (stop === release) stop = null
      }
      const stopListening = listen(GESTURES, release)
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
