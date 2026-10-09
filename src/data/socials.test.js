import { describe, expect, it } from 'vitest'
import socials from './socials.json'
import { FILLED, HTTPS, withoutDuplicates } from './rules.js'

// Mes profils (GitHub, LinkedIn), lus par SocialLinks dans l'accueil et la nav.
// Une clé mal écrite (« url » au lieu de « href ») donnerait un lien sans adresse.

describe('socials.json', () => {
  it('contient au moins un profil', () => {
    expect(socials.length).toBeGreaterThan(0)
  })

  it('contient LinkedIn : « À propos » cherche ce profil par son nom', () => {
    expect(socials.map((social) => social.name)).toContain('LinkedIn')
  })

  it('donne à chaque profil une adresse et un nom différents', () => {
    // l'adresse sert de key React ; deux fois le même nom, on ne saurait lequel choisir
    const hrefs = socials.map((social) => social.href)
    const names = socials.map((social) => social.name)
    expect(hrefs).toEqual(withoutDuplicates(hrefs))
    expect(names).toEqual(withoutDuplicates(names))
  })

  describe.each(socials)('$name', (social) => {
    it('a un nom rempli', () => {
      expect(social.name).toMatch(FILLED)
    })

    it('a une adresse en https', () => {
      expect(social.href).toMatch(HTTPS)
    })

    it("n'a que les clés name et href", () => {
      expect(Object.keys(social).sort()).toEqual(['href', 'name'])
    })
  })
})
