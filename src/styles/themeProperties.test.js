// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { describe, expect, it } from 'vitest'
import { readThemes } from './readThemes.js'

// Les couleurs du thème, propriétés typées (@property) : sans elles, le
// navigateur ne sait pas animer une variable, et le fondu de la nav (§ 7.7)
// sauterait d'un coup
const { css, themes } = readThemes()
const kraft = themes.find(({ name }) => name === 'paper-light').declarations
// « rgba(0, 0, 0, 0.14) » → « rgba\(0, 0, 0, 0\.14\) » (lu tel quel par RegExp)
const literal = (text) => text.replace(/[.()]/g, '\\$&')

describe('propriétés typées des thèmes', () => {
  it.each(['bg', 'ink', 'ink-2', 'accent', 'line', 'surface'])(
    '--%s est une couleur, héritée, au départ celle du kraft',
    (key) => {
      expect(css).toMatch(
        new RegExp(
          `@property --${key} \\{\\s*syntax: ["']<color>["'];\\s*inherits: true;\\s*initial-value: ${literal(kraft[`--${key}`])};`,
        ),
      )
    },
  )

  it('six, ni plus ni moins : color-scheme est une vraie propriété, pas une variable', () => {
    expect(css.match(/@property /g)).toHaveLength(6)
    expect(css).not.toContain('--scheme')
  })
})

describe('le <body>', () => {
  it('ne fond pas ses couleurs : le fondu se joue sur la nav (§ 7.7)', () => {
    // couleur et fond ensemble passaient par le même gris (1,09 : 1, revue
    // du 8 oct.) ; caché par les pièces, le fond du <body> ne se voit pas
    expect(css).toMatch(/\nbody \{[^}]*background-color: var\(--bg\);/)
    // ni dans la règle, ni dans un bloc @media, ni par html ou :root
    // (le fondu reviendrait par un autre chemin : la revue l'a fait passer)
    expect(css).not.toMatch(/(?:body|html|:root)[^{}]*\{[^}]*transition/)
  })
})
