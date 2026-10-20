// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { compileString } from 'sass-embedded'
import { describe, expect, it } from 'vitest'

// L'ordre des calques (_tokens.scss) : la nav, puis l'avatar volant qui passe
// au-dessus, puis le lien d'évitement au-dessus de tout le site, puis le
// pré-chargeur qui couvre tout. Revue générale (19 oct.) : $z-nav à 70 ou
// $z-skip-link à 5 passaient sans un rouge — le lien d'évitement serait passé
// sous la nav. Les valeurs sont lues par Sass lui-même
const { css } = compileString(
  `@use 'abstracts' as *;
  :root { --layers: #{$z-nav} #{$z-avatar} #{$z-skip-link} #{$z-loader}; }`,
  { loadPaths: [import.meta.dirname] },
)

describe('les calques (z-index)', () => {
  it('empilent nav < avatar < lien d’évitement < pré-chargeur', () => {
    const [nav, avatar, skipLink, loader] = css
      .match(/--layers: ([\d ]+);/)[1]
      .split(' ')
      .map(Number)
    expect(nav).toBeLessThan(avatar)
    expect(avatar).toBeLessThan(skipLink)
    expect(skipLink).toBeLessThan(loader)
  })
})
