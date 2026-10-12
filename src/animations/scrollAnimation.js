// Le trajet du défilement animé, image par image (§ 7.6). Écrit à la main
// plutôt qu'avec animate() de Motion : ≈ 11 Ko de moins au démarrage (§ 11,
// décision de Kevin du 10 oct.). Même forme qu'animate() : une valeur qui va
// de from à to, et de quoi l'arrêter ou attendre sa fin.

/**
 * @param {number} from - la valeur de départ (la position de défilement)
 * @param {number} to - la valeur d'arrivée
 * @param {{ duration: number, ease: (t: number) => number,
 *   onUpdate: (value: number) => void }} options - duration en secondes ;
 *   ease : la courbe (easing.js) ; onUpdate : appelée à chaque image
 * @returns {{ stop: () => void, then: (callback: () => void) => Promise<void> }}
 *   stop : arrête net (la fin n'est alors jamais annoncée) ; then : à l'arrivée
 *
 * @example
 * scrollAnimation(scrollY, 900, { duration: 0.8, ease: easeInOutQuint, onUpdate: (y) => scrollTo(0, y) })
 */
export function scrollAnimation(from, to, { duration, ease, onUpdate }) {
  let frame = 0
  let finish
  const finished = new Promise((resolve) => {
    finish = resolve
  })
  const start = performance.now()

  function step() {
    const t = Math.min(1, (performance.now() - start) / (duration * 1000))
    onUpdate(from + (to - from) * ease(t))
    if (t < 1) frame = requestAnimationFrame(step)
    else finish()
  }

  frame = requestAnimationFrame(step)
  return {
    stop: () => cancelAnimationFrame(frame),
    then: (callback) => finished.then(callback),
  }
}
