// La boucle du brouillard de l'intro (§ 7.4) : une image par rafraîchissement
// de l'écran, jusqu'à la brume levée. Chargée avec fog.js après le premier
// affichage (Fog.jsx), hors du chemin critique (budget, § 11).
import { createFog, createNoise, fogSize } from './fog.js'
import { INTRO } from './usePreloader.js'

/**
 * Fait jouer le brouillard sur un canvas.
 *
 * Une seule horloge, celle du calendrier de l'intro (usePreloader) : le
 * brouillard est là où l'heure le dit, quel que soit le nombre d'images
 * passées. Revue : il comptait le lever depuis la première image vue après
 * l'ouverture — un onglet masqué ou un retour arrière (images suspendues)
 * rejouait le voile opaque sur une page déjà prête, puis le coupait net.
 *
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas
 * @param {CanvasRenderingContext2D} options.context - son contexte 2D
 * @param {number} options.start - le départ du calendrier (performance.now())
 * @param {() => { phase: string, rushed: boolean }} options.readState - l'état de l'intro du moment
 * @param {() => void} options.painted - appelé après la première image
 * @param {() => number} [options.random] - pour des tests reproductibles
 * @returns {() => void} de quoi l'arrêter
 *
 * @example
 * const stop = playFog({ canvas, context, start, readState, painted })
 */
export function playFog({
  canvas,
  context,
  start,
  readState,
  painted,
  random,
}) {
  const noise = createNoise(random)
  let fog
  let image
  let lastT = 0
  function resize() {
    const { width, height } = fogSize(window.innerWidth, window.innerHeight)
    canvas.width = width
    canvas.height = height
    fog = createFog({ width, height, noise })
    fog.measure(lastT)
    image = context.createImageData(width, height)
  }
  resize()

  const openAt = start + INTRO.open * 1000 // l'ouverture, à l'heure du calendrier
  let lifting = false // le lever a commencé (bornes mesurées sur le bruit du moment)
  let rushedAt = null
  let rushedFrom = 0
  let progress = 0
  let first = true
  let frame = 0
  function tick(now) {
    const t = (now - start) / 1000
    lastT = t
    const { phase, rushed } = readState()
    // trop tard dès la première image : le voile CSS s'efface déjà sans lui
    if (first && (phase !== 'drawing' || rushed)) return
    if ((rushed || now >= openAt) && !lifting) {
      lifting = true
      fog.measure(t)
    }
    if (rushed && rushedAt === null) {
      rushedAt = now
      rushedFrom = progress
    }
    if (rushedAt !== null) {
      // le geste : la fin en accéléré, d'où la brume en était
      const rush = (now - rushedAt) / 1000 / INTRO.rush
      progress = Math.min(1, rushedFrom + rush * (1 - rushedFrom))
    } else if (lifting) {
      progress = Math.min(1, (now - openAt) / 1000 / INTRO.lift)
    }
    fog.draw(t, progress, image)
    context.putImageData(image, 0, 0)
    if (first) {
      first = false
      painted()
    }
    if (progress < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  window.addEventListener('resize', resize)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
  }
}
