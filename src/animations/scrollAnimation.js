// Le trajet du défilement animé, image par image. Écrit à la main plutôt
// qu'avec animate() de Motion (≈ 11 Ko de moins au démarrage), avec la même
// forme : une valeur de from à to, et de quoi l'arrêter ou attendre sa fin.

/**
 * @param {number} from - la position de départ
 * @param {number} to - la position d'arrivée
 * @param {{ duration: number, ease: (t: number) => number,
 *   onUpdate: (value: number) => void }} options - duration en secondes
 * @returns {{ stop: () => void, then: (callback: () => void) => Promise<void> }}
 *   stop arrête net (la fin n'est alors jamais annoncée)
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
