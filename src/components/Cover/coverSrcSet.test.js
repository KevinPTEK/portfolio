import { describe, expect, it } from 'vitest'
import { COVER_WIDTHS, coverSrcSet, coverVariants } from './coverSrcSet.js'

// La convention des captures de projet (§ 5.1) : l'originale fait 1 200 px de
// large ; à côté d'elle, des versions plus petites, nommées par leur largeur
describe('coverSrcSet', () => {
  it('les largeurs plus petites que l’originale : 600 et 900 px', () => {
    expect(COVER_WIDTHS).toEqual([600, 900])
  })

  it('chaque capture en 600, 900 et 1 200 px (l’originale)', () => {
    expect(coverSrcSet('/images/argent-cover.webp')).toBe(
      '/images/argent-cover-600.webp 600w, /images/argent-cover-900.webp 900w, /images/argent-cover.webp 1200w',
    )
  })
})

describe('coverVariants', () => {
  it('les versions plus petites, nommées par leur largeur', () => {
    expect(coverVariants('/images/nina-cover.webp')).toEqual([
      { src: '/images/nina-cover-600.webp', width: 600 },
      { src: '/images/nina-cover-900.webp', width: 900 },
    ])
  })
})
