// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, outsideMedia } from '../../testing/css.js'

// L'avatar volant (§ 7.9) : sa place est dans FlyingAvatar.scss, son vol dans
// une transformation (FlyingAvatar.jsx)
const css = compileScss(join(import.meta.dirname, 'FlyingAvatar.scss'))
const screen = outsideMedia(css)
const inMedia = (wanted) =>
  mediaBlocks(css)
    .filter(({ query }) => query.trim() === wanted)
    .map(({ body }) => body)
    .join('\n')
const print = inMedia('print')
const notPrint = inMedia('not print')

describe('FlyingAvatar.scss', () => {
  it('fixé en haut à gauche de l’écran, au-dessus de la nav (z-index 40)', () => {
    const rule = screen.match(/\.flying-avatar \{([^}]*)\}/)[1]
    expect(rule).toContain('position: fixed')
    expect(rule).toContain('top: 0')
    expect(rule).toContain('left: 0')
    expect(rule).toContain('z-index: 40')
  })

  it('réduit depuis son coin haut gauche, et laisse passer les clics', () => {
    const rule = screen.match(/\.flying-avatar \{([^}]*)\}/)[1]
    expect(rule).toContain('transform-origin: 0 0')
    expect(rule).toContain('pointer-events: none')
  })

  // à l'écran seulement : à l'impression, chaque emplacement garde son
  // portrait, sans dépendre de l'ordre des règles (revue : un bloc print placé
  // avant la règle d'écran perdait)
  it('pendant le vol, à l’écran, les deux emplacements s’effacent', () => {
    expect(notPrint).toMatch(
      /\[data-avatar=flying\] \[data-avatar-slot\] \{\s*visibility: hidden;\s*\}/,
    )
    expect(screen).not.toContain('data-avatar-slot')
    expect(print).not.toContain('data-avatar-slot')
  })

  it('à l’impression : pas d’avatar volant', () => {
    expect(print).toMatch(/\.flying-avatar \{\s*display: none;\s*\}/)
  })
})
