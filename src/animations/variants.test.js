// @vitest-environment node
// (lit le Sass sur le disque : aucun DOM ici)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DURATION_SLOW,
  EASE_OUT,
  STAGGER,
  rise,
  stagger,
  unblur,
} from './variants.js'

// JavaScript ne lit pas le Sass : les deux copies doivent rester d'accord
const tokens = readFileSync(
  join(import.meta.dirname, '../styles/abstracts/_tokens.scss'),
  'utf8',
)
function token(name) {
  const match = tokens.match(new RegExp(`\\$${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`jeton introuvable dans _tokens.scss : $${name}`)
  return match[1].trim()
}

describe('variants', () => {
  it('reprend la courbe et la durée des jetons Sass', () => {
    expect(`cubic-bezier(${EASE_OUT.join(', ')})`).toBe(token('ease-out'))
    expect(`${DURATION_SLOW}s`).toBe(token('duration-slow'))
  })

  it('rise : fondu et montée de 24 px, en 0,9 s', () => {
    expect(rise.hidden).toEqual({ opacity: 0, y: 24 })
    expect(rise.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE_OUT },
    })
  })

  it('unblur : flou de 14 px et montée de 14 px, sans opacité (LCP, § 7.4)', () => {
    expect(unblur.hidden).toEqual({ filter: 'blur(14px)', y: 14 })
    expect(unblur.visible).toEqual({
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 1.1, ease: EASE_OUT },
      // net, plus aucun filtre : un filter resté posé, même nul, change le
      // repère des éléments position: fixed qu'il contient (revue)
      transitionEnd: { filter: 'none' },
    })
  })

  it('stagger : 120 ms entre deux enfants par défaut, ou ce qu’on lui donne', () => {
    expect(STAGGER).toBe(0.12)
    // le parent, lui, ne bouge pas : seuls ses enfants arrivent
    expect(stagger().hidden).toEqual({})
    expect(stagger().visible.transition).toEqual({
      staggerChildren: 0.12,
      delayChildren: 0,
    })
    expect(stagger(0.2, 0.15).visible.transition).toEqual({
      staggerChildren: 0.2,
      delayChildren: 0.15,
    })
  })
})
