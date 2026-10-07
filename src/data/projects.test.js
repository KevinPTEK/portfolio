import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import menu from './menu.json'
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

// les noms des thèmes, lus dans la map Sass : chaque entrée s'écrit « nom: ( »
const THEMES = [
  ...readFileSync(
    join(import.meta.dirname, '../styles/abstracts/_themes.scss'),
    'utf8',
  ).matchAll(/^\s*([a-z0-9-]+): \(/gm),
].map(([, name]) => name)

describe('projects.json', () => {
  it('contient au moins un projet', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('donne à chaque projet un id différent', () => {
    // l'id sert de key React et d'id HTML : deux fois le même casse les deux
    const ids = projects.map((project) => project.id)
    expect(ids).toEqual(withoutDuplicates(ids))
  })

  it("ne réutilise l'id d'aucune pièce du site (home, about, work…)", () => {
    // l'id d'un projet est l'id HTML de sa pièce : « work » ferait deux #work
    const roomIds = ['home', ...menu.map((room) => room.id)]
    for (const project of projects) {
      expect(roomIds).not.toContain(project.id)
    }
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

    it('a un thème défini dans _themes.scss', () => {
      // un thème inconnu (« ninaa ») : data-theme ne correspond à aucune règle CSS,
      // la pièce garde les couleurs de la page, sans aucune erreur
      expect(THEMES).toContain(project.theme)
    })

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

    it.each(['challenges', 'learned', 'tags'])(
      'a une liste « %s » sans doublon',
      (field) => {
        // chaque texte sert de key React (TagList, listes du détail)
        expect(project[field]).toEqual(withoutDuplicates(project[field]))
      },
    )

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
