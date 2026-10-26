import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { playFog } from './playFog.js'

// Les images se jouent à la main (frame) : on peut en sauter, comme un onglet
// masqué. Un hasard reproductible, un faux canvas qui garde la dernière image
function seeded(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}
let queue
const frame = (now) => {
  const pending = queue
  queue = []
  pending.forEach((callback) => callback(now))
}
let last
const context = {
  createImageData: (width, height) => ({
    data: new Uint8ClampedArray(width * height * 4),
  }),
  putImageData: (image) => {
    last = [...image.data.filter((_, i) => i % 4 === 3)]
  },
}
const opaque = () => last.every((alpha) => alpha === 255)
const clear = () => last.every((alpha) => alpha === 0)

describe('playFog', () => {
  let state
  let painted
  const play = () =>
    playFog({
      canvas: document.createElement('canvas'),
      context,
      start: 0, // le calendrier de l'intro part à 0 ms : ouverture à 2 450 ms
      readState: () => state,
      painted,
      random: seeded(3),
    })

  beforeEach(() => {
    queue = []
    last = null
    state = { phase: 'drawing', rushed: false }
    painted = vi.fn()
    vi.stubGlobal('requestAnimationFrame', (callback) => queue.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => (queue = []))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('pendant le tracé : le voile, opaque ; « peint » une seule fois', () => {
    play()
    frame(16)
    expect(opaque()).toBe(true)
    frame(32)
    expect(painted).toHaveBeenCalledTimes(1)
  })

  it('images sautées (onglet masqué) : le brouillard est là où l’heure le dit', () => {
    play()
    frame(16)
    state = { phase: 'ready', rushed: false }
    frame(2450 + 0.6 * 3200) // aucune image depuis le tracé : 60 % du lever
    expect(opaque()).toBe(false)
    expect(clear()).toBe(false)
  })

  it('à l’heure de la fin, plus rien, et la boucle s’arrête', () => {
    play()
    frame(16)
    state = { phase: 'ready', rushed: false }
    frame(2450 + 3200)
    expect(clear()).toBe(true)
    expect(queue).toHaveLength(0)
  })

  it('trop tard dès la première image : il ne peint rien, le voile CSS s’en charge', () => {
    play()
    state = { phase: 'opening', rushed: false }
    frame(2600)
    expect(last).toBe(null)
    expect(painted).not.toHaveBeenCalled()
    expect(queue).toHaveLength(0)
  })

  it('un geste en plein lever : la brume continue d’où elle était, et finit en 0,5 s', () => {
    play()
    frame(16)
    state = { phase: 'ready', rushed: false }
    frame(2450 + 0.6 * 3200)
    state = { phase: 'ready', rushed: true }
    frame(2450 + 0.6 * 3200 + 16) // pas de retour au voile opaque
    expect(opaque()).toBe(false)
    frame(2450 + 0.6 * 3200 + 16 + 500)
    expect(clear()).toBe(true)
    expect(queue).toHaveLength(0)
  })

  it('un geste pendant le tracé : le lever part de là, en 0,5 s', () => {
    play()
    frame(16)
    state = { phase: 'ready', rushed: true }
    frame(1000)
    expect(opaque()).toBe(true) // le premier instant du lever : encore le voile
    frame(1500)
    expect(clear()).toBe(true)
  })

  it('arrêté : plus d’image, plus d’écoute du redimensionnement', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const stop = play()
    frame(16)
    stop()
    expect(queue).toHaveLength(0)
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('l’écran change de taille : le canvas suit (≈ 240 px de large)', () => {
    const canvas = document.createElement('canvas')
    playFog({
      canvas,
      context,
      start: 0,
      readState: () => state,
      painted,
      random: seeded(3),
    })
    const width = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      value: 2400,
      configurable: true,
    })
    try {
      window.dispatchEvent(new Event('resize'))
      expect(canvas.width).toBe(240)
      expect(canvas.height).toBe(77) // 768 / 10
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        configurable: true,
      })
    }
  })
})
