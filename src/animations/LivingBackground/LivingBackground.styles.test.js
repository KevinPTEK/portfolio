// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé de happy-dom n'a rien à faire ici)
import { join } from 'node:path'
import { compile } from 'sass-embedded'
import { describe, expect, it } from 'vitest'

// Le CSS compilé du fond. Ce qui se voit (couleurs, fusions, contraste) se
// mesure dans le navigateur (§ 10) ; ce qui casserait sans bruit se vérifie
// ici : un fond par-dessus le texte, une liste de fusion décalée d'un cran…
const { css } = compile(join(import.meta.dirname, 'LivingBackground.scss'))

// découpe une valeur sur un séparateur, hors parenthèses et guillemets
// (une adresse data: contient des « ; » et des « , »)
function splitTopLevel(text, separator) {
  const parts = []
  let depth = 0
  let quote = null
  let current = ''
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === separator && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

// les déclarations du premier bloc « sélecteur { … } » (hors @media)
function declarations(selector) {
  // en début de ligne, ou tout en haut du fichier (la première règle)
  const start = `\n${css}`.indexOf(`\n${selector} {`)
  expect(start, `règle ${selector}`).toBeGreaterThanOrEqual(0)
  const open = css.indexOf('{', start)
  const close = css.indexOf('\n}', open)
  return Object.fromEntries(
    splitTopLevel(css.slice(open + 1, close), ';').map((declaration) => {
      const colon = declaration.indexOf(':')
      return [
        declaration.slice(0, colon).trim(),
        declaration.slice(colon + 1).trim(),
      ]
    }),
  )
}

describe('LivingBackground (CSS compilé)', () => {
  it('reste derrière le contenu, dans sa pièce, sans capter la souris', () => {
    expect(declarations('.living-background')).toMatchObject({
      position: 'absolute',
      inset: '0',
      'z-index': '-1',
      overflow: 'hidden',
      'pointer-events': 'none',
    })
  })

  it.each(['forced-colors: active', 'prefers-contrast: more'])(
    'disparaît avec « %s »',
    (feature) => {
      // contraste forcé : les images en url() ne sont pas retirées (MDN) ;
      // plus de contraste demandé : le grain et la hachure restent sous le texte
      const media = new RegExp(
        `@media[^{]*\\(${feature}\\)[^{]*\\{\\s*\\.living-background\\s*\\{\\s*display: none;`,
      )
      expect(css).toMatch(media)
    },
  )

  it('donne une fusion à chaque calque du papier', () => {
    // une liste plus courte se répète : chaque calque prendrait le mode du voisin
    const paper = declarations('.living-background--paper')
    const layers = splitTopLevel(paper['background-image'], ',')
    const modes = splitTopLevel(paper['background-blend-mode'], ',')
    expect(layers.length).toBeGreaterThan(1)
    expect(modes).toHaveLength(layers.length)
  })

  it.each(['kraft', 'cool'])(
    'le ton « %s » définit chaque valeur que lit le papier',
    (tone) => {
      // une variable oubliée rend tout le fond invalide : le papier disparaît
      const paper = declarations('.living-background--paper')[
        'background-image'
      ]
      const used = new Set(paper.match(/--paper-[a-z]+/g))
      const defined = Object.keys(declarations(`.living-background--${tone}`))
      expect(used.size).toBeGreaterThan(0)
      expect(defined).toEqual(expect.arrayContaining([...used]))
    },
  )

  it('calcule chaque bruit sur sa tuile exacte (aucune couture)', () => {
    // sans région de filtre, le bruit couvre −10 % à 120 % de la tuile : il
    // se raccorde sur 1,2 tuile, et la tuile répétée laisse une couture
    const filters = css.match(/<filter[^>]*>/g)
    expect(filters.length).toBeGreaterThan(0)
    for (const filter of filters) {
      expect(filter).toMatch(/x='0' y='0' width='1' height='1'/)
    }
  })
})
