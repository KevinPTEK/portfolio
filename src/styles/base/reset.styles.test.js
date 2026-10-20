// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, ruleBody } from '../../testing/css.js'

// Le reset : ce qu'il garantit à toutes les images du site. On compile
// l'entrée main.scss et non _reset.scss, comme readThemes : un @forward
// 'reset' oublié dans base/_index.scss laissait ce test vert (revue de
// l'étape 5), alors que les captures reprenaient 900 px de haut
const css = compileScss(join(import.meta.dirname, '../main.scss'))

describe('_reset.scss', () => {
  // une <img width height> réduite par max-width garde ses proportions : sans
  // height: auto, l'attribut height l'emporte (une capture de 900 px de haut
  // dans une carte de 340 px de large, étape 5). (^|\s) : la propriété
  // elle-même, pas min-height
  it('une image ne dépasse pas de son conteneur et garde ses proportions', () => {
    expect(ruleBody(css, 'img,\npicture,\nsvg,\nvideo,\ncanvas')).toMatch(
      /(^|\s)max-width: 100%/,
    )
    expect(ruleBody(css, 'img')).toMatch(/(^|\s)height: auto/)
  })

  // la modale native : le navigateur la centre par margin: auto, que
  // « * { margin: 0 } » effacerait. Revue générale (19 oct.) : sans cette
  // règle, la modale se collait en haut à gauche, tests verts
  it('laisse le navigateur centrer la modale native', () => {
    expect(ruleBody(css, 'dialog')).toMatch(/(^|\s)margin: auto/)
  })
})
