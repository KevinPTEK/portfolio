import { describe, expect, it } from 'vitest'
import sites from './sites.json'
import {
  FILLED,
  HTTPS,
  IMAGE_PATH,
  SLUG,
  UNPROTECTED_SPACE,
  withoutDuplicates,
} from './rules.js'

// Les sites vitrines de la pièce « Autres réalisations » : une carte chacun.
// Mêmes règles que projects.json, en plus court (ni contexte, ni problèmes,
// ni apprentissages) — et les liens inversés : le site est obligatoire,
// le code facultatif (le code d'un client n'est pas toujours public).

describe('sites.json', () => {
  it('contient au moins un site', () => {
    expect(sites.length).toBeGreaterThan(0)
  })

  it('donne à chaque site un id différent', () => {
    // l'id sert de key React : deux fois le même et React mélange les cartes
    const ids = sites.map((site) => site.id)
    expect(ids).toEqual(withoutDuplicates(ids))
  })

  it('donne à chaque site sa propre adresse et sa propre capture', () => {
    // un nouveau site s'écrit en copiant un ancien : ce qu'on oublie de changer se voit ici
    const urls = sites.map((site) => site.links.site)
    const covers = sites.map((site) => site.cover.src)
    expect(urls).toEqual(withoutDuplicates(urls))
    expect(covers).toEqual(withoutDuplicates(covers))
  })

  describe.each(sites)('$id', (site) => {
    it('a un id en minuscules, chiffres et tirets', () => {
      expect(site.id).toMatch(SLUG)
    })

    it.each(['name', 'summary'])('a un texte « %s » rempli', (field) => {
      expect(site[field]).toMatch(FILLED)
    })

    it('met une espace insécable avant « : ; ! ? » et dans les guillemets', () => {
      // une espace simple laisse la ligne se couper juste avant la ponctuation
      for (const text of [site.name, site.summary]) {
        expect(text).not.toMatch(UNPROTECTED_SPACE)
      }
    })

    it('a une liste de tags non vide, sans texte vide', () => {
      expect(site.tags).toBeInstanceOf(Array)
      expect(site.tags.length).toBeGreaterThan(0)
      for (const tag of site.tags) {
        expect(tag).toMatch(FILLED)
      }
    })

    it('a des tags tous différents', () => {
      // chaque tag sert de key React dans TagList
      expect(site.tags).toEqual(withoutDuplicates(site.tags))
    })

    it('a un lien vers le site en ligne, en https', () => {
      expect(site.links.site).toMatch(HTTPS)
    })

    it("a un lien vers son code en https, s'il est public", () => {
      expect(site.links.code).toBeOneOf([
        undefined,
        expect.stringMatching(HTTPS),
      ])
    })

    it("n'a que des liens connus : site et code", () => {
      // une faute de clé (« sit ») ferait disparaître le lien sans erreur
      for (const key of Object.keys(site.links)) {
        expect(['site', 'code']).toContain(key)
      }
    })

    it('a une capture et un texte alternatif', () => {
      expect(site.cover.src).toMatch(IMAGE_PATH)
      expect(site.cover.alt).toMatch(FILLED)
    })
  })
})
