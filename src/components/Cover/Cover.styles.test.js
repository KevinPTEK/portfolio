// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, ruleBody } from '../../testing/css.js'

// Le cadre des captures (mixin cover-frame), chez les trois parents de Cover.
// Cover pose width="1200" height="900" (la place réservée avant le CSS) : le
// navigateur en fait une hauteur de 900 px, et aspect-ratio ne joue que si
// la hauteur reste automatique — sans height: auto, la capture gardait ses
// 900 px de haut dans une carte de 340 px de large (vu par Kevin, 16 oct.).
// Ce height: auto est dans le reset, pour toutes les images (reset.styles.test.js) :
// le cadre ne doit pas reposer de hauteur par-dessus
const frames = [
  ['../ProjectCard/ProjectCard.scss', '.project-card__cover'],
  ['../SiteCard/SiteCard.scss', '.site-card__cover'],
  ['../../sections/Work/ProjectDetails.scss', '.project-details__cover'],
]

describe.each(frames)('%s', (file, selector) => {
  const rule = ruleBody(compileScss(join(import.meta.dirname, file)), selector)

  // (^|\s) : la propriété elle-même, pas max-width ni min-height (revue)
  it('toute la largeur, la hauteur calculée au format 4 : 3', () => {
    expect(rule).toMatch(/(^|\s)width: 100%/)
    expect(rule).not.toMatch(/(^|\s)height:/)
    expect(rule).toContain('aspect-ratio: 4/3') // Sass écrit 4/3
  })
})
