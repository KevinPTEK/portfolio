import { describe, expect, it } from 'vitest'
import projects from './projects.json'
import {
  FILLED,
  HTTPS,
  IMAGE_PATH,
  SLUG,
  UNPROTECTED_SPACE,
  withoutDuplicates,
} from './rules.js'

// Une faute dans projects.json ne casse pas le build : elle casse la page,
// ou pire, l'affiche mal sans aucune erreur. Ces tests sont les règles que
// chaque projet doit respecter, aujourd'hui et quand on en ajoutera un.

describe('projects.json', () => {
  it('contient au moins un projet', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('donne à chaque projet un id différent', () => {
    // l'id sert de key React et d'id HTML : deux fois le même casse les deux
    const ids = projects.map((project) => project.id)
    expect(ids).toEqual(withoutDuplicates(ids))
  })

  it('donne à chaque projet sa propre capture et son propre dépôt', () => {
    // un nouveau projet s'écrit en copiant un ancien : ce qu'on oublie de changer se voit ici
    const covers = projects.map((project) => project.cover.src)
    const repos = projects.map((project) => project.links.code)
    expect(covers).toEqual(withoutDuplicates(covers))
    expect(repos).toEqual(withoutDuplicates(repos))
  })

  describe.each(projects)('$id', (project) => {
    it.each(['id', 'theme'])(
      'a un « %s » en minuscules, chiffres et tirets',
      (field) => {
        // ni espace, ni capitale, ni accent : sinon l'id HTML ou le thème ne correspond plus
        expect(project[field]).toMatch(SLUG)
      },
    )

    // à écrire avec les thèmes nina et events : un thème mal écrit (« ninaa ») passe encore
    it.todo('a un thème défini dans _themes.scss')

    it.each(['name', 'title', 'accentWord', 'summary', 'context'])(
      'a un texte « %s » rempli',
      (field) => {
        expect(project[field]).toMatch(FILLED)
      },
    )

    it('met une espace insécable avant « : ; ! ? » et dans les guillemets', () => {
      // une espace simple laisse la ligne se couper juste avant la ponctuation
      const texts = [
        project.name,
        project.title,
        project.summary,
        project.context,
        ...project.challenges,
        ...project.learned,
      ]
      for (const text of texts) {
        expect(text).not.toMatch(UNPROTECTED_SPACE)
      }
    })

    it('met en accent la fin exacte de son titre', () => {
      // sinon SectionHeader affiche le titre sans accent, sans erreur
      const { title, accentWord } = project
      expect(
        title.endsWith(accentWord),
        `« ${title} » doit finir par « ${accentWord} »`,
      ).toBe(true)
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

    it('a des tags tous différents', () => {
      // chaque tag sert de key React dans TagList
      expect(project.tags).toEqual(withoutDuplicates(project.tags))
    })

    it('a un lien vers son code en https', () => {
      expect(project.links.code).toMatch(HTTPS)
    })

    it("a un lien vers son site en https, s'il en a un", () => {
      // 724events et Argent Bank ne sont pas publiés : pas de lien, c'est voulu
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
      expect(project.cover.src).toMatch(IMAGE_PATH)
      expect(project.cover.blur).toMatch(IMAGE_PATH)
      expect(project.cover.alt).toMatch(FILLED)
    })

    it('a une version floutée différente de sa capture', () => {
      // la même adresse ferait charger l'image nette (≈ 120 Ko) à la place des 4 Ko prévus
      expect(project.cover.blur).not.toBe(project.cover.src)
    })
  })
})
