// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, outsideMedia } from '../../testing/css.js'

// Le survol B (§ 7.5) se voit dans le navigateur, et ses débordements se
// mesurent (check-menu-zoom.mjs) ; ce qui casserait sans bruit se vérifie
// ici : un grossissement qui ignore « réduire les animations », un projecteur
// qui se déclenche au doigt…
const css = compileScss(join(import.meta.dirname, 'GiantMenu.scss'))
const blocks = mediaBlocks(css)
const plain = outsideMedia(css)
const bodies = (keep) =>
  blocks
    .filter(({ query }) => keep(query))
    .map(({ body }) => body)
    .join('\n')
// les blocs où le mot a le droit de grandir
const allowed = bodies((query) =>
  query.includes('prefers-reduced-motion: no-preference'),
)

describe('GiantMenu.scss', () => {
  it('grossit le mot de 8 %, seulement en bureau et sans « réduire les animations »', () => {
    // sous 1 024 px, « COMPÉTENCES » n'a pas la place : défilement horizontal
    // à 320 px, anneau coupé à gauche de 768 à 1 023 px (mesuré, 11 oct.)
    expect(plain).not.toContain('scale(')
    for (const { query, body } of blocks.filter(({ body }) =>
      body.includes('scale('),
    )) {
      expect(query).toContain('prefers-reduced-motion: no-preference')
      expect(query).toContain('min-width: 1024px')
      expect(body).toContain('transform: scale(1.08)')
    }
    expect(allowed).toContain('transform: scale(1.08)')
  })

  it('au repos, rien ne grossit', () => {
    expect(allowed).not.toMatch(/\.giant-menu__link \{[^}]*scale\(/)
  })

  it('grandit depuis son centre (depuis sa gauche, il débordait en bureau)', () => {
    expect(plain).toMatch(
      /\.giant-menu__link \{[^}]*transform-origin: 50% 60%;/,
    )
  })

  it('le focus clavier met le mot en accent, et le grossit en bureau', () => {
    expect(plain).toMatch(
      /\.giant-menu__link:focus-visible \{\s*color: var\(--accent\);/,
    )
    expect(allowed).toMatch(
      /\.giant-menu__link:focus-visible \{\s*transform: scale\(1\.08\);/,
    )
  })

  it('le survol fait de même, avec une souris seulement', () => {
    const hover = bodies((query) => query.startsWith('(hover: hover)'))
    expect(plain).not.toContain(':hover')
    expect(hover).toMatch(
      /\.giant-menu__link:hover \{\s*color: var\(--accent\);/,
    )
    expect(allowed).toMatch(
      /\.giant-menu__link:hover \{\s*transform: scale\(1\.08\);/,
    )
  })

  it('avec une souris, le projecteur estompe tout mot ni survolé ni au focus', () => {
    // un seul projecteur pour les deux : sinon chacun estompait le mot que
    // l'autre mettait en avant (souris sur un mot, Tab sur un autre — revue)
    expect(bodies((query) => query === '(hover: hover)')).toMatch(
      /\.giant-menu:has\(\.giant-menu__link:is\(:hover, :focus-visible\)\) \.giant-menu__link:not\(:hover, :focus-visible\) \{\s*color: color-mix\(in srgb, var\(--ink\) 75%, var\(--bg\)\);/,
    )
  })

  it('sans souris, le projecteur suit le focus clavier', () => {
    expect(bodies((query) => query === '(hover: none)')).toMatch(
      /\.giant-menu:has\(\.giant-menu__link:focus-visible\) \.giant-menu__link:not\(:focus-visible\) \{\s*color: color-mix\(in srgb, var\(--ink\) 75%, var\(--bg\)\);/,
    )
    // aucun projecteur hors de ces deux cas : il entrerait en conflit
    expect(plain).not.toContain(':has(')
  })

  it('sous « réduire les animations », le fondu de couleur reste (§ 10)', () => {
    expect(plain).toMatch(
      /\.giant-menu__link \{[^}]*transition: color 0\.6s cubic-bezier\(0\.2, 0\.8, 0\.2, 1\);/,
    )
    expect(allowed).toMatch(
      /\.giant-menu__link \{\s*transition: transform 0\.6s cubic-bezier\(0\.2, 0\.8, 0\.2, 1\), color 0\.6s cubic-bezier\(0\.2, 0\.8, 0\.2, 1\);/,
    )
  })

  it('garde sa cible tactile, son anneau, et l’écart du numéro', () => {
    expect(plain).toMatch(/\.giant-menu__link \{[^}]*min-height: 44px;/)
    expect(plain).toMatch(/\.giant-menu__link \{[^}]*padding-right: 0\.15em;/)
    expect(plain).toMatch(
      /\.giant-menu__link:focus-visible \{\s*outline: 2px solid var\(--accent\);/,
    )
  })

  // WCAG 1.4.12 (espacement du texte forcé : lettres + 0,12 em) :
  // « COMPÉTENCES » ne tenait plus à 320-414 px, la page défilait de 47 px à
  // l'horizontale. Coupé à la française (« COMPÉ-TENCES », lang="fr"),
  // seulement s'il ne tient plus : l'affichage normal ne change pas (mesuré
  // dans Chrome ; Firefox ne coupe pas « Compétences », majuscule en tête)
  it('demande la coupure à la française d’un mot trop long', () => {
    expect(plain).toMatch(/\.giant-menu__link \{[^}]*hyphens: auto;/)
  })

  it("n'a plus de calque", () => {
    expect(css).not.toMatch(/attr\(|data-label|giant-menu__word/)
  })

  // chaque ligne entre floue et décalée (unblur, écrit dans l'attribut style,
  // § 7.4) : nette et en place quand même sans moteur, à l'impression, au focus
  it('lignes nettes sans moteur, à l’impression et au focus clavier', () => {
    const settled =
      /\{\s*filter: none !important;\s*transform: none !important;\s*\}/.source
    expect(css).toMatch(
      new RegExp(`\\[data-motion=off\\] \\.giant-menu__item ${settled}`),
    )
    expect(css).toMatch(
      new RegExp(`\\.giant-menu__item:focus-within ${settled}`),
    )
    expect(bodies((query) => query === 'print')).toMatch(
      new RegExp(`\\.giant-menu__item ${settled}`),
    )
  })
})
