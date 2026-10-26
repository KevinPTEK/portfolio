// La trajectoire de l'avatar volant, en fonctions pures. Le départ (l'accueil)
// se mesure dans la page, qui défile ; l'arrivée (la nav) dans l'écran.
import { easeOutQuad } from '../easing.js'

// segments droits du vol tracé par le navigateur : à 48, l'écart à la courbe
// reste sous un demi-pixel (flight.test.js)
const STEPS = 48

/**
 * La distance de défilement du vol : 45 % de l'écran, 260 px au moins
 *
 * @param {number} viewportHeight - la hauteur de l'écran, en pixels
 * @returns {number} en pixels de défilement
 */
export function flightDistance(viewportHeight) {
  return Math.max(260, viewportHeight * 0.45)
}

/**
 * Où est l'avatar quand la page a défilé de scrollY ?
 *
 * @param {number} scrollY
 * @param {{ from: { left: number, top: number, size: number },
 *   to: { left: number, top: number, size: number }, distance: number }} geometry
 *   from : l'emplacement de l'accueil (top dans la page) ; to : celui de la nav
 *   (top dans l'écran) ; distance : flightDistance()
 * @returns {{ x: number, y: number, size: number }} position dans l'écran, diamètre
 */
export function flightAt(scrollY, { from, to, distance }) {
  // une courbe qui part vite : l'avatar quitte tôt le départ, qui défile, et
  // ne sort jamais de l'écran
  const e = easeOutQuad(Math.min(1, Math.max(0, scrollY / distance)))
  const fromTop = from.top - scrollY // le départ défile avec la page
  return {
    x: from.left + (to.left - from.left) * e,
    y: fromTop + (to.top - fromTop) * e,
    size: from.size + (to.size - from.size) * e,
  }
}

/**
 * Le vol en points réguliers, pour le navigateur qui le trace lui-même
 * (ScrollTimeline) : il relie les points par des droites.
 *
 * @param {object} geometry - comme pour flightAt
 * @param {number} [steps] - le nombre de segments
 * @returns {{ offset: number, x: number, y: number, size: number }[]} offset :
 *   l'avancée du vol, de 0 à 1
 */
export function flightSamples(geometry, steps = STEPS) {
  return Array.from({ length: steps + 1 }, (_, i) => ({
    offset: i / steps,
    ...flightAt((geometry.distance * i) / steps, geometry),
  }))
}
