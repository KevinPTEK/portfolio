// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, ruleBody } from '../../testing/css.js'

// L'accueil sous l'intro (§ 7.4) : sa mise au point (CSS, piloté par
// <html data-intro>), et ses filets de sécurité pour l'entrée (Motion)
const css = compileScss(join(import.meta.dirname, 'Home.scss'))
const rule = (selector) => ruleBody(css, selector)
const settled =
  /\{\s*filter: none !important;\s*transform: none !important;\s*\}/.source

describe('Home.scss — sous l’intro', () => {
  it('pendant le tracé du sceau : l’accueil agrandi de 5 % et flou de 10 px', () => {
    const drawing = rule('[data-intro=drawing] .home__layout')
    expect(drawing).toContain('transform: scale(1.05)')
    expect(drawing).toContain('filter: blur(10px)')
  })

  it('puis la mise au point en 2,8 s, sur la courbe de la maquette', () => {
    const layout = rule('.home__layout')
    expect(layout).toMatch(
      /transition: transform 2\.8s cubic-bezier\(0\.25, 0\.7, 0\.2, 1\), filter 2\.8s cubic-bezier\(0\.25, 0\.7, 0\.2, 1\)/,
    )
  })

  it('le visiteur a fait un geste : la mise au point se presse aussi (0,5 s)', () => {
    expect(rule('[data-intro-rushed] .home__layout')).toContain(
      'transition-duration: 0.5s',
    )
  })

  it('le bloc identité net et en place sans moteur, à l’impression et au focus', () => {
    expect(css).toMatch(
      new RegExp(`\\[data-motion=off\\] \\.home__identity ${settled}`),
    )
    expect(css).toMatch(new RegExp(`\\.home__identity:focus-within ${settled}`))
    const print = mediaBlocks(css)
      .filter(({ query }) => query === 'print')
      .map(({ body }) => body)
      .join('\n')
    expect(print).toMatch(new RegExp(`\\.home__identity ${settled}`))
  })
})
