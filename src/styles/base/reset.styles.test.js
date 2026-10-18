// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, ruleBody } from '../../testing/css.js'

// Le reset : ce qu'il garantit à toutes les images du site
const css = compileScss(join(import.meta.dirname, '_reset.scss'))

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
})
