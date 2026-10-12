import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../App.jsx'
import { useFakeIntersectionObserver } from '../../testing/FakeIntersectionObserver.js'

// Où vivent les apparitions (§ 7.3) : dans chaque pièce sous l'accueil,
// jamais dans l'accueil — un bloc invisible au premier écran retarderait le LCP
describe('Reveal dans les pièces', () => {
  useFakeIntersectionObserver()

  it("jamais dans l'accueil", () => {
    const { container } = render(<App />)
    expect(container.querySelector('#home')).not.toBe(null)
    expect(container.querySelector('#home .reveal')).toBe(null)
  })

  // chaque bloc nommé : « au moins un par pièce » laissait passer un bloc
  // oublié (9 mutants sur 13 survivaient, revue)
  it.each([
    ['about', ['.about__text', '.about__portrait']],
    ['argent', ['.project-card']],
    ['events', ['.project-card']],
    ['nina', ['.project-card']],
    ['other-work', ['.section-header', '.other-work__list']],
    ['skills', ['.section-header', '.skills__groups']],
    ['contact', ['.section-header', '.contact__email', '.contact__actions']],
  ])('pièce « %s » : chaque bloc apparaît', (id, selectors) => {
    const { container } = render(<App />)
    for (const selector of selectors) {
      const block = container.querySelector(`#${id} ${selector}`)
      expect(block, `${id} ${selector}`).not.toBe(null)
      expect(block.closest('.reveal'), `${id} ${selector}`).not.toBe(null)
    }
  })

  it.each([
    ['skills', '.skills__groups', '.skills__group'],
    ['other-work', '.other-work__list', '.other-work__item'],
  ])(
    'dans « %s », les cartes arrivent en cascade : la liste ne bouge pas, chaque carte part cachée',
    (id, list, card) => {
      // sans RevealItem, les cartes seraient là d'emblée ; sans stagger, la
      // liste entière monterait d'un bloc — sans aucune erreur
      const { container } = render(<App />)
      const parent = container.querySelector(`#${id} ${list}`)
      expect(parent).toHaveClass('reveal')
      expect(parent.style.opacity).toBe('')
      const cards = [...container.querySelectorAll(`#${id} ${card}`)]
      expect(cards.length).toBeGreaterThan(0)
      for (const item of cards) {
        expect(item).toHaveClass('reveal')
        expect(item.style.opacity).toBe('0')
      }
    },
  )
})
