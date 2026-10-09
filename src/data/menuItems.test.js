import { describe, expect, it } from 'vitest'
import menu from './menu.json'
import { menuItems, sectionLabel } from './menuItems.js'

describe('menuItems', () => {
  it('prépare chaque entrée du menu : id, libellé, ancre, numéro', () => {
    expect(menuItems).toEqual(
      menu.map(({ id, label }, index) => ({
        id,
        label,
        href: `#${id}`,
        number: String(index + 1).padStart(2, '0'),
      })),
    )
  })
})

describe('sectionLabel', () => {
  it.each([
    ['about', '01 — À propos'],
    ['contact', '04 — Contact'],
  ])("donne l'étiquette de la pièce %s : « %s »", (id, label) => {
    expect(sectionLabel(id)).toBe(label)
  })

  it('dit quel id manque, au lieu d’une page blanche', () => {
    expect(() => sectionLabel('competences')).toThrow('« competences »')
  })
})
