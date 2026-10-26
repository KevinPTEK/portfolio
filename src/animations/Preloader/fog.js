// Le brouillard de l'intro, en fonctions pures. Deux temps, chacun guidé par
// un champ de bruit :
//  1. la lumière : la lueur du sceau se diffuse en volutes dans le voile
//     sombre, qui devient brume crème ;
//  2. le lever : la brume s'amincit par nappes et découvre la page.
import { easeInOutQuad } from '../easing.js'

// Réglages de la maquette
const VEIL_DEEP = [58, 51, 44] // le voile #4E463D, plus sombre aux bords…
const VEIL_LIGHT = [102, 92, 80] // …plus clair dans les volutes
const MIST = [247, 238, 225] // la brume : crème, un ton au-dessus du kraft
const GLOW = [238, 200, 164] // lueur abricot à la lisière de la lumière (le R du sceau)
const A1 = 0.95 // lumière : force du bruit sur son front…
const B1 = 0.24 // …et largeur de sa lisière
const A2 = 1.55 // brume : nappes plus marquées…
const B2 = 0.17
const D2 = 0.55 // …et moins liées au centre : elle se lève un peu partout à la fois
const MIST_MAX = 0.92 // la brume la plus dense laisse deviner la page

/** Lissage d'Hermite : 0 sous a, 1 au-dessus de b, une courbe douce entre les deux */
export function smoothstep(a, b, value) {
  const k = Math.min(1, Math.max(0, (value - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/** La taille du canvas : ≈ 240 px de large, au moins 4 fois plus petit que l'écran */
export function fogSize(viewportWidth, viewportHeight) {
  const scale = Math.max(4, viewportWidth / 240)
  return {
    width: Math.ceil(viewportWidth / scale),
    height: Math.ceil(viewportHeight / scale),
  }
}

/**
 * Un bruit « de valeur » lissé (une grille de valeurs au hasard, interpolée en
 * douceur), et sa version en trois couches de plus en plus fines (fbm).
 * @param {() => number} [random] - pour des tests reproductibles
 */
export function createNoise(random = Math.random) {
  const perm = new Uint8Array(256)
  const values = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    perm[i] = i
    values[i] = random()
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  const lattice = (x, y) => values[perm[(perm[x & 255] + y) & 255]]

  function noise(x, y) {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    // interpolation quintique : plus douce que smoothstep, la grille ne se devine plus
    let fx = x - ix
    let fy = y - iy
    fx = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
    fy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
    const a = lattice(ix, iy)
    const b = lattice(ix + 1, iy)
    const c = lattice(ix, iy + 1)
    const d = lattice(ix + 1, iy + 1)
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }

  // trois couches, chacune tournée pour casser la grille
  const fbm = (x, y) =>
    noise(x, y) * 0.5 +
    noise((x * 0.8 - y * 0.6) * 2.1 + 5.2, (x * 0.6 + y * 0.8) * 2.1 + 1.3) *
      0.3 +
    noise(
      (x * 0.28 - y * 0.96) * 4.3 + 9.7,
      (x * 0.96 + y * 0.28) * 4.3 + 3.1,
    ) *
      0.2

  return { noise, fbm }
}

/**
 * Le brouillard d'un canvas de width × height pixels.
 *
 * @param {{ width: number, height: number, noise: { fbm: Function } }} options
 * @returns {{ measure: (t: number) => void,
 *   draw: (t: number, p: number, image: { data: Uint8ClampedArray }) => void }}
 *   t : secondes depuis le début (le voile ondule déjà pendant le tracé) ;
 *   p : avancée de l'ouverture, de 0 à 1. measure(t) : à l'ouverture.
 */
export function createFog({ width, height, noise: { fbm } }) {
  const aspect = width / height
  const maxDist = Math.hypot(aspect / 2, 0.5) // les coins sont à la distance 1

  // deux champs de bruit ; le premier « tord » le second (volutes). Rangés
  // dans fn et fm plutôt que dans un tableau : aucun déchet par pixel
  let fn = 0
  let fm = 0
  function field(dx, dy, t) {
    const w = fbm(dx * 1.3 + t * 0.05, dy * 1.3 + t * 0.09)
    fn = fbm(dx * 2.3 + w * 1.9 - t * 0.04, dy * 2.3 + w * 1.9 + t * 0.16) // + t : le brouillard monte
    fm = (fn + w) * 0.5
  }

  // les bornes des deux fronts, mesurées sur le vrai bruit à l'ouverture : la
  // lumière part tout de suite (pas de temps mort), et il ne reste rien à la fin
  let r1Start = 0
  let r1End = 1
  let r2Start = 0
  let r2End = 1
  function measure(t) {
    let lo1 = Infinity
    let hi1 = -Infinity
    let lo2 = Infinity
    let hi2 = -Infinity
    for (let y = 0; y <= 40; y++) {
      for (let x = 0; x <= 40; x++) {
        field((x / 40 - 0.5) * aspect, y / 40 - 0.5, t)
        lo1 = Math.min(lo1, fn)
        hi1 = Math.max(hi1, fn)
        lo2 = Math.min(lo2, fm)
        hi2 = Math.max(hi2, fm)
      }
    }
    r1Start = (lo1 - 0.5) * A1 - B1 - 0.02
    r1End = 1 + (hi1 - 0.5) * A1 + B1 + 0.02
    r2Start = (lo2 - 0.5) * A2 - B2 - 0.02
    r2End = D2 + (hi2 - 0.5) * A2 + B2 + 0.02
  }

  function draw(t, p, image) {
    const pl = easeInOutQuad(Math.min(1, p / 0.5)) // 1. la lumière gagne l'écran sur la première moitié
    const pm = easeInOutQuad(Math.max(0, (p - 0.15) / 0.85)) // 2. la brume se lève ensuite
    const r1 = r1Start + (r1End - r1Start) * pl
    const r2 = r2Start + (r2End - r2Start) * pm
    const fade = 1 - smoothstep(0.92, 1, p) // plus une volute quand le canvas s'en va
    const data = image.data
    let i = 0
    for (let y = 0; y < height; y++) {
      const dy = (y + 0.5) / height - 0.5
      for (let x = 0; x < width; x++, i += 4) {
        const dx = ((x + 0.5) / width - 0.5) * aspect
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist // 0 au sceau, 1 dans les coins
        field(dx, dy, t)
        // 1 : encore dans le voile sombre
        const dark =
          p === 0 ? 1 : smoothstep(r1 - B1, r1 + B1, dist + (fn - 0.5) * A1)
        const mist =
          smoothstep(r2 - B2, r2 + B2, dist * D2 + (fm - 0.5) * A2) * MIST_MAX
        const alpha = Math.max(dark, mist) * fade
        if (alpha < 0.003) {
          data[i + 3] = 0
          continue
        }
        // brume crème, modelée par le bruit (du volume, pas un aplat)…
        const k = 1 + (fm - 0.5) * 0.2
        let r = MIST[0] * k
        let g = MIST[1] * k
        let b = MIST[2] * k
        // …teintée d'abricot à la lisière de la lumière…
        const glow = 1.8 * dark * (1 - dark)
        r += (GLOW[0] - r) * glow
        g += (GLOW[1] - g) * glow
        b += (GLOW[2] - b) * glow
        // …et rattrapée par le voile là où la lumière n'est pas encore arrivée
        const s = Math.min(
          1,
          Math.max(0, 0.62 - dist * 0.55 + (fn - 0.5) * 1.1),
        )
        r += (VEIL_DEEP[0] + (VEIL_LIGHT[0] - VEIL_DEEP[0]) * s - r) * dark
        g += (VEIL_DEEP[1] + (VEIL_LIGHT[1] - VEIL_DEEP[1]) * s - g) * dark
        b += (VEIL_DEEP[2] + (VEIL_LIGHT[2] - VEIL_DEEP[2]) * s - b) * dark
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = alpha * 255
      }
    }
  }

  measure(0)
  return { measure, draw }
}
