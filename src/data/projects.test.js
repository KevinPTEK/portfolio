import { describe, expect, it } from 'vitest'
import projects from './projects.json'

// Une faute dans projects.json ne casse pas le build : elle casse la page,
// ou pire, l'affiche mal sans aucune erreur. Ces tests sont les règles que
// chaque projet doit respecter, aujourd'hui et quand on en ajoutera un.

// au moins un caractère visible (pas vide, pas que des espaces)
const FILLED = /\S/
// une adresse web complète et sécurisée
const HTTPS = /^https:\/\//
// une image WebP de public/images (servie à la racine du site)
const IMAGE = /^\/images\/.+\.webp$/

describe('projects.json', () => {
  it('contient au moins un projet', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('donne à chaque projet un id différent', () => {
    // l'id sert de key React et d'id HTML : deux fois le même casse les deux
    const ids = projects.map((project) => project.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe.each(projects)('$id', (project) => {
    it('a un id en minuscules, chiffres et tirets', () => {
      // il devient un id HTML (« argent-title ») : ni espace ni accent
      expect(project.id).toMatch(/^[a-z0-9-]+$/)
    })

    it.each(['name', 'title', 'accentWord', 'summary', 'context', 'theme'])(
      'a un texte « %s » rempli',
      (field) => {
        expect(project[field]).toMatch(FILLED)
      },
    )

    it('met en accent la fin exacte de son titre', () => {
      // sinon SectionHeader affiche le titre sans accent, sans erreur
      expect(project.title.endsWith(project.accentWord)).toBe(true)
    })

    it.each(['challenges', 'learned', 'tags'])(
      'a une liste « %s » non vide, sans texte vide',
      (field) => {
        const list = project[field]
        expect(list).toBeInstanceOf(Array)
        expect(list.length).toBeGreaterThan(0)
        for (const item of list) {
          expect(item).toMatch(FILLED)
        }
      },
    )

    it('a des technologies toutes différentes', () => {
      // chaque tag sert de key React dans TagList
      expect(new Set(project.tags).size).toBe(project.tags.length)
    })

    it("a un lien vers son code, et vers son site seulement s'il est publié", () => {
      expect(project.links.code).toMatch(HTTPS)
      expect(project.links.site).toBeOneOf([
        undefined,
        expect.stringMatching(HTTPS),
      ])
    })

    it("n'a que des liens connus : site et code", () => {
      // une faute de clé (« sit ») ferait disparaître le lien sans erreur
      for (const key of Object.keys(project.links)) {
        expect(['site', 'code']).toContain(key)
      }
    })

    it('a une capture, sa version floutée et un texte alternatif', () => {
      expect(project.cover.src).toMatch(IMAGE)
      expect(project.cover.blur).toMatch(IMAGE)
      expect(project.cover.alt).toMatch(FILLED)
    })
  })
})
