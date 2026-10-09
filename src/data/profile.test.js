// @vitest-environment node
// (aucun DOM ici : des données, et le CV lu sur le disque)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import profile from './profile.json'
import { FILLED, UNPROTECTED_SPACE } from './rules.js'

// Qui je suis, partagé par l'accueil, la nav, « À propos », « Contact » et le
// pied de page (§ 5.3). Le CV est null tant que le PDF n'existe pas : le
// bouton reste caché, plutôt qu'un lien vers un fichier absent.

const PUBLIC = join(import.meta.dirname, '../../public')
const KB = 1000 // comme les « kB » des DevTools (images.test.js)

describe('profile.json', () => {
  it.each(['name', 'job', 'copyright'])('a un texte « %s » rempli', (key) => {
    expect(profile[key]).toMatch(FILLED)
    expect(profile[key]).not.toMatch(UNPROTECTED_SPACE)
  })

  it('a une adresse e-mail de la forme nom@domaine.ext', () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i)
  })

  it("n'a que des clés connues", () => {
    // une faute de clé (« emial ») ferait disparaître le lien sans erreur
    expect(Object.keys(profile).sort()).toEqual(
      ['copyright', 'cv', 'email', 'job', 'name'].sort(),
    )
  })

  it('décrit le CV, ou vaut null tant que le PDF manque', () => {
    expect(profile.cv).toBeOneOf([
      null,
      {
        href: expect.stringMatching(/^\/[a-z0-9-]+\.pdf$/),
        size: expect.stringMatching(/^\d+ Ko$/),
      },
    ])
  })

  describe.runIf(profile.cv)('le CV', () => {
    const name = profile.cv?.href.slice(1)

    it('existe dans public/, avec ce nom exact', () => {
      // readdirSync : le disque du Mac ne distingue pas les majuscules,
      // le serveur Linux de Netlify si (images.test.js)
      expect(readdirSync(PUBLIC)).toContain(name)
    })

    it('est un vrai PDF', () => {
      expect(readFileSync(join(PUBLIC, name)).toString('latin1', 0, 5)).toBe(
        '%PDF-',
      )
    })

    it('annonce son vrai poids (le libellé le donne, § 6)', () => {
      const bytes = statSync(join(PUBLIC, name)).size
      expect(profile.cv.size).toBe(`${Math.round(bytes / KB)} Ko`)
    })
  })
})
