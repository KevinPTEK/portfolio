import { describe, expect, it } from 'vitest'
import menu from './menu.json'
import { FILLED, SLUG, UNPROTECTED_SPACE, withoutDuplicates } from './rules.js'

// Les pièces du menu (le menu géant de l'accueil, puis la nav), dans leur ordre.
// L'id de chaque entrée est l'id de la pièce : le lien mène à #about, #work…

describe('menu.json', () => {
  it('contient au moins une pièce', () => {
    expect(menu.length).toBeGreaterThan(0)
  })

  it('donne à chaque pièce un id différent', () => {
    // l'id sert de key React et d'ancre (#about) : deux fois le même, un lien mène au mauvais endroit
    const ids = menu.map((room) => room.id)
    expect(ids).toEqual(withoutDuplicates(ids))
  })

  describe.each(menu)('$id', (room) => {
    it('a un id en minuscules, chiffres et tirets', () => {
      expect(room.id).toMatch(SLUG)
    })

    it('a un libellé rempli, sans espace simple devant « : ; ! ? »', () => {
      expect(room.label).toMatch(FILLED)
      expect(room.label).not.toMatch(UNPROTECTED_SPACE)
    })
  })
})
