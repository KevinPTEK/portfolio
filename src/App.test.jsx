import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App.jsx'
import { menuItems } from './data/menuItems.js'
import {
  cross,
  useFakeIntersectionObserver,
} from './testing/FakeIntersectionObserver.js'

// La page entière : lien d'évitement, nav, puis les pièces dans <main>.
// La pièce courante vient de IntersectionObserver (faux ici, § 7.7).

// la nav, par son repère « Sections » : Testing Library compte aussi comme
// bannières les <header> des sections, que HTML-AAM exclut (un <header> dans
// une <section> n'est pas une bannière — à vérifier dans Chrome, § 8), et
// donne un nom vide à un repère masqué : on lit son aria-label
const banner = () =>
  screen
    .getAllByRole('navigation', { hidden: true })
    .find((nav) => nav.getAttribute('aria-label') === 'Sections')
    .closest('header')

describe('App', () => {
  useFakeIntersectionObserver()
  // un lien cliqué change l'adresse (useScrollTo) : rendue même si un test échoue
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it("commence par le lien d'évitement, vers le contenu", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    const skip = screen.getByRole('link', { name: 'Aller au contenu' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', '#main')
  })

  it('donne au contenu la cible du lien, focalisable par le code', () => {
    // tabindex -1 : le focus y arrive vraiment (lecteurs d'écran compris),
    // sans que <main> entre dans la tabulation
    render(<App />)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('place le lien, puis la nav, puis le contenu', () => {
    render(<App />)
    const order = [
      screen.getByRole('link', { name: 'Aller au contenu' }),
      banner(),
      screen.getByRole('main'),
    ]
    for (const [before, after] of [order.slice(0, 2), order.slice(1)]) {
      expect(
        before.compareDocumentPosition(after) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  // (au-dessus de la nav par son z-index : FlyingAvatar.styles.test.js)
  it('place l’avatar volant après la nav et avant le contenu (ordre de la § 8)', () => {
    render(<App />)
    const flying = document.querySelector('.flying-avatar')
    const following = (before, after) =>
      before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(following(banner(), flying)).toBeTruthy()
    expect(following(flying, screen.getByRole('main'))).toBeTruthy()
  })

  it('cache la nav au chargement et sur l’accueil', () => {
    render(<App />)
    // aucune pièce choisie avant le premier rapport de l'observateur
    expect(banner()).toHaveClass('nav--hidden')
    cross({ home: true })
    expect(banner()).toHaveClass('nav--hidden')
    // l'accueil n'est pas dans le menu : aucun lien courant
    expect(banner().querySelector('[aria-current]')).toBe(null)
  })

  it.each([
    ['about', '01 À propos'],
    ['argent', '02 Travaux'],
    ['other-work', '02 Travaux'],
    ['skills', '03 Compétences'],
    ['contact', '04 Contact'],
  ])('montre la nav sur %s et y marque « %s »', (room, link) => {
    render(<App />)
    cross({ home: false, [room]: true })
    expect(banner()).not.toHaveClass('nav--hidden')
    const nav = within(banner()).getByRole('navigation', { name: 'Sections' })
    const current = within(nav)
      .getAllByRole('link')
      .filter((candidate) => candidate.hasAttribute('aria-current'))
    expect(current.map((candidate) => candidate.textContent)).toEqual([link])
  })

  it('anime le défilement : un lien du menu met le focus sur la pièce et l’adresse à jour', () => {
    // useScrollTo branché (le trajet lui-même : useScrollTo.test.jsx)
    render(<App />)
    const link = within(
      screen.getByRole('navigation', { name: 'Menu principal' }),
    ).getByRole('link', { name: /À propos/ })
    expect(fireEvent.click(link)).toBe(false)
    expect(document.getElementById('about')).toHaveFocus()
    expect(window.location.hash).toBe('#about')
  })

  it('mène chaque lien du menu à un élément de la page', () => {
    // un id renommé laisserait le menu géant et la nav pointer vers rien
    render(<App />)
    for (const { href } of menuItems) {
      expect(document.querySelector(href), href).not.toBe(null)
    }
  })

  it('range les pièces dans l’ordre du menu (01, 02, 03, 04)', () => {
    // les numéros du menu disent l'ordre de la visite
    render(<App />)
    const targets = menuItems.map(({ href }) => document.querySelector(href))
    for (const [before, after] of targets
      .slice(1)
      .map((t, i) => [targets[i], t])) {
      expect(
        before.compareDocumentPosition(after) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('place le pied de page après le contenu, hors de <main>', () => {
    // dans <main> (ou dans une section), <footer> ne serait plus le repère
    // contentinfo (APG)
    render(<App />)
    const main = screen.getByRole('main')
    const footer = screen.getByRole('contentinfo')
    expect(main.contains(footer)).toBe(false)
    expect(
      main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
