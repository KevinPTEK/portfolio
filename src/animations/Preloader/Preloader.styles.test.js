// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, ruleBody } from '../../testing/css.js'

// Le voile de l'intro (§ 7.4) et ce que son état (<html data-intro>) règle
// sur la page
const css = compileScss(join(import.meta.dirname, 'Preloader.scss'))
const rule = (selector) => ruleBody(css, selector)

describe('Preloader.scss', () => {
  it('le voile couvre tout l’écran, au-dessus de tout (z-index 60)', () => {
    const veil = rule('.preloader')
    expect(veil).toContain('position: fixed')
    expect(veil).toContain('inset: 0')
    expect(veil).toContain('z-index: 60')
  })

  // le canvas déborde de 32 px de chaque côté (son flou n'éclaircit pas les
  // bords) : le reset (canvas { max-width: 100% }) le coupait à droite — une
  // bande de 32 px de page découverte (vu sur la capture du tracé)
  it('le brouillard déborde de l’écran de chaque côté, sans plafond de largeur', () => {
    const fog = rule('.preloader__fog')
    expect(fog).toContain('inset: -32px')
    expect(fog).toContain('width: calc(100% + 64px)')
    expect(fog).toContain('max-width: none')
  })

  // le brouillard a pris le relais : c'est lui qui peint le voile (revue : un
  // fond resté opaque sous le canvas passait les tests)
  it('le brouillard peint, le voile devient transparent', () => {
    expect(rule('.preloader--fog')).toContain('background-color: transparent')
  })

  // revue : imprimée pendant les cinq premières secondes, la page ne montrait
  // que le voile
  it('à l’impression : pas de voile', () => {
    const print = mediaBlocks(css)
      .filter(({ query }) => query === 'print')
      .map(({ body }) => body)
      .join('\n')
    expect(print).toMatch(/\.preloader \{\s*display: none;\s*\}/)
  })

  it('pas de défilement avant « ready », la place de la barre gardée', () => {
    const locked = rule(':root[data-intro=drawing],\n:root[data-intro=opening]')
    expect(locked).toContain('overflow: hidden')
    expect(locked).toContain('scrollbar-gutter: stable')
    // revue : un élément fixe ne couvre pas la gouttière réservée, peinte avec
    // le fond de la page — 15 px de kraft à droite du voile (barres classiques)
    expect(locked).toContain('background-color: #4e463d')
    expect(css).not.toMatch(/data-intro=ready\][^{]*\{[^}]*overflow: hidden/)
  })

  it('à « ready », on clique à travers la brume', () => {
    expect(rule('[data-intro=ready] .preloader')).toContain(
      'pointer-events: none',
    )
  })

  it('sans brouillard (pas de canvas) : le voile s’efface en fondu', () => {
    const fade = rule(
      '[data-intro=opening] .preloader:not(.preloader--fog),\n[data-intro=ready] .preloader:not(.preloader--fog)',
    )
    expect(fade).toContain('opacity: 0')
    expect(fade).toMatch(/transition: opacity 1\.6s/)
  })
})
