// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé de happy-dom n'a rien à faire ici)
import { describe, expect, it } from 'vitest'
import { readThemes } from './readThemes.js'

const { css, themes } = readThemes()

// Ce que chaque pièce, chaque carte et chaque bouton lisent : une variable
// absente ne donne aucune erreur, seulement un texte ou une carte invisibles.
const EXPECTED = [
  'color-scheme',
  '--bg',
  '--ink',
  '--ink-2',
  '--accent',
  '--line',
  '--surface',
]

// ---------- Contraste WCAG (formule de la luminance relative) ----------

// « #6e4e2e » ou « rgba(255, 255, 255, 0.55) » → { rgb, alpha }
function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const rgb = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16))
    return { rgb, alpha: 1 }
  }
  const rgba = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  if (rgba) return { rgb: rgba.slice(1, 4).map(Number), alpha: Number(rgba[4]) }
  throw new Error(`Couleur non lue : ${value}`)
}

// une couleur translucide posée sur un fond opaque
function over({ rgb, alpha }, background) {
  return rgb.map((channel, i) => alpha * channel + (1 - alpha) * background[i])
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

describe('thèmes', () => {
  it('compile au moins les deux papiers et un projet', () => {
    expect(themes.map((theme) => theme.name)).toEqual(
      expect.arrayContaining(['paper-light', 'paper-cool', 'argent']),
    )
  })

  it('lit chaque bloc [data-theme] du CSS', () => {
    // un nom que l'expression régulière ne saurait pas lire ferait
    // disparaître son thème des tests, sans erreur : on compte
    expect(themes).toHaveLength(css.match(/\[data-theme=/g).length)
  })

  it('applique le kraft à la racine, avant tout JavaScript', () => {
    expect(css).toMatch(/:root,\s*\[data-theme=["']?paper-light["']?\]/)
  })

  describe.each(themes)('$name', ({ declarations }) => {
    it('déclare toutes les variables, et seulement elles', () => {
      // une faute (« --surfce ») ou un oubli se voient ici
      expect(Object.keys(declarations).sort()).toEqual([...EXPECTED].sort())
    })

    // Calculés sur un fond uni : le grain du papier les fera varier (§ 10).
    // Une carte = --surface posée sur le fond de la pièce.
    it.each(['--ink', '--ink-2'])(
      'écrit %s lisiblement sur le fond et sur une carte (4,5 : 1 au moins)',
      (property) => {
        const background = parseColor(declarations['--bg']).rgb
        const card = over(parseColor(declarations['--surface']), background)
        const text = parseColor(declarations[property]).rgb
        expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(text, card)).toBeGreaterThanOrEqual(4.5)
      },
    )

    it("garde l'accent visible sur le fond et sur une carte (3 : 1 au moins)", () => {
      // l'accent ne colore que de grands titres et l'anneau de focus :
      // le seuil est celui des grands textes et des éléments d'interface
      const background = parseColor(declarations['--bg']).rgb
      const card = over(parseColor(declarations['--surface']), background)
      const accent = parseColor(declarations['--accent']).rgb
      expect(contrast(accent, background)).toBeGreaterThanOrEqual(3)
      expect(contrast(accent, card)).toBeGreaterThanOrEqual(3)
    })
  })
})
