import { describe, expect, it } from 'vitest'
import projects from './projects.json'
import { FILLED, UNPROTECTED_SPACE, withoutDuplicates } from './rules.js'
import sites from './sites.json'
import skills from './skills.json'

// Les compétences, par familles (§ 5.2). Des règles, pas un contenu : ajouter
// une compétence ne doit rien casser. Une compétence peut citer la preuve
// qui la montre : l'id d'un projet ou d'un site de la page.

const items = skills.flatMap((group) => group.items)
const evidence = [...projects, ...sites].map((work) => work.id)

describe('skills.json', () => {
  it('contient au moins une famille', () => {
    expect(skills.length).toBeGreaterThan(0)
  })

  it('donne à chaque famille un nom différent', () => {
    const names = skills.map((group) => group.group)
    expect(names).toEqual(withoutDuplicates(names))
  })

  it('donne à chaque compétence un nom différent (key React)', () => {
    const names = items.map((item) => item.name)
    expect(names).toEqual(withoutDuplicates(names))
  })

  describe.each(skills)('$group', (group) => {
    it('a un nom rempli et au moins une compétence', () => {
      expect(group.group).toMatch(FILLED)
      expect(group.items.length).toBeGreaterThan(0)
    })

    it("n'a que des clés connues : group et items", () => {
      // une faute de clé (« item ») ferait disparaître la famille sans erreur
      expect(Object.keys(group).sort()).toEqual(['group', 'items'])
    })

    describe.each(group.items)('$name', (item) => {
      it('a un nom rempli, et un détail rempli s’il en a un', () => {
        expect(item.name).toMatch(FILLED)
        expect(item.detail).toBeOneOf([
          undefined,
          expect.stringMatching(FILLED),
        ])
      })

      it('a un niveau entier de 1 à 3 (●○○ à ●●●)', () => {
        expect([1, 2, 3]).toContain(item.level)
      })

      it('cite, s’il en a une, une preuve qui existe dans la page', () => {
        // un projet ou un site renommé laisserait un lien vers nulle part
        expect(item.proof).toBeOneOf([undefined, ...evidence])
      })

      it("n'a que des clés connues : name, detail, level, proof", () => {
        for (const key of Object.keys(item)) {
          expect(['name', 'detail', 'level', 'proof']).toContain(key)
        }
      })

      it('met une espace insécable avant « : ; ! ? » et dans les guillemets', () => {
        for (const text of [item.name, item.detail ?? '']) {
          expect(text).not.toMatch(UNPROTECTED_SPACE)
        }
      })
    })
  })
})
