// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, outsideMedia } from '../testing/css.js'

// Les cibles des liens internes (§ 7.6) : useScrollTo y met le focus (tabindex
// -1, par le code seulement). Ce ne sont pas des contrôles : pas d'anneau
// autour d'une pièce entière — au clavier, Chrome en dessinerait un
const src = join(import.meta.dirname, '..')

describe('cibles du défilement animé', () => {
  it.each([
    ['components/Room/Room.scss', '.room'], // les pièces
    ['sections/Work/Work.scss', '.work'], // « Travaux » vise le conteneur des projets
    ['sections/Home/Home.scss', '.home__menu'], // « Menu » de la barre mobile
    ['App.scss', '.main'], // le lien d'évitement et « Haut de page »
  ])('%s : %s sans anneau au focus', (file, selector) => {
    const css = outsideMedia(compileScss(join(src, file)))
    expect(css).toMatch(
      new RegExp(
        // (?:^|\\n) : .main est la première règle de son fichier
        `(?:^|\\n)${selector.replace('.', '\\.')}:focus \\{\\s*outline: none;\\s*\\}`,
      ),
    )
  })
})
