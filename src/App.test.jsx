import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App.jsx'
import { MotionProvider } from './animations/MotionProvider.jsx'
import { PLAYED_KEY } from './animations/Preloader/usePreloader.js'
import { menuItems } from './data/menuItems.js'
import {
  cross,
  useFakeIntersectionObserver,
} from './testing/FakeIntersectionObserver.js'

// La page entière. La pièce courante vient de IntersectionObserver (faux ici).

// la nav, par son repère « Sections » : Testing Library compte aussi les
// <header> des sections comme bannières (à tort), et donne un nom vide à un
// repère masqué
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
    // tabindex -1 : le focus y arrive, sans que <main> entre dans la tabulation
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

  it('place l’avatar volant après la nav et avant le contenu', () => {
    render(<App />)
    const flying = document.querySelector('.flying-avatar')
    const following = (before, after) =>
      before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(following(banner(), flying)).toBeTruthy()
    expect(following(flying, screen.getByRole('main'))).toBeTruthy()
  })

  // l'arrivée (rechargement, lien direct) : la nav prend les couleurs de la
  // première pièce d'emblée, puis fond normalement d'une pièce à l'autre
  it('à l’arrivée, la nav prend ses couleurs d’emblée, puis fond normalement', async () => {
    render(<App />)
    expect(banner()).toHaveClass('nav--arriving')
    cross({ argent: true })
    await act(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    )
    expect(banner()).not.toHaveClass('nav--arriving')
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
    ['journey', '02 Parcours'],
    ['argent', '03 Travaux'],
    ['other-work', '03 Travaux'],
    ['skills', '04 Compétences'],
    ['contact', '05 Contact'],
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
    // useScrollTo est branché (le trajet : useScrollTo.test.jsx)
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

  it('range les pièces dans l’ordre du menu (01, 02, 03…)', () => {
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

// L'intro : l'accueil et l'avatar volant attendent qu'elle rende la main
describe('App — l’intro', () => {
  useFakeIntersectionObserver()
  afterEach(() => {
    MotionGlobalConfig.skipAnimations = false
  })

  it('le voile, décoratif, passe avant tout le reste', () => {
    const { container } = render(<App />)
    const veil = container.firstElementChild
    expect(veil).toHaveClass('preloader')
    expect(veil).toHaveAttribute('aria-hidden', 'true')
  })

  it('pendant l’intro, l’accueil et l’avatar volant attendent', async () => {
    MotionGlobalConfig.skipAnimations = true
    render(
      <MotionProvider>
        <App />
      </MotionProvider>,
    )
    // le moteur, chargé après le premier rendu
    await vi.dynamicImportSettled()
    await act(async () => {})
    // puis deux images : Motion démarre une animation à l'image suivante
    await act(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    )
    expect(document.querySelector('.home__identity').style.filter).toBe(
      'blur(14px)',
    )
    expect(
      document.querySelector('.flying-avatar__entrance').style.filter,
    ).toBe('blur(14px)')
  })

  // à « ready » (2,9 s), pas seulement à la fin : sous la brume qui se lève
  it('à « ready », sous la brume, l’accueil et l’avatar volant entrent', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    MotionGlobalConfig.skipAnimations = true
    const { container } = render(
      <MotionProvider>
        <App />
      </MotionProvider>,
    )
    act(() => vi.advanceTimersByTime(2900))
    vi.useRealTimers()
    expect(container.querySelector('.preloader')).not.toBe(null)
    await waitFor(() =>
      expect(document.querySelector('.home__identity').style.filter).toBe(
        'none',
      ),
    )
    expect(
      document.querySelector('.flying-avatar__entrance').style.filter,
    ).toBe('none')
  })

  it('intro sautée (déjà jouée) : l’accueil et l’avatar volant entrent ensemble', async () => {
    window.sessionStorage.setItem(PLAYED_KEY, '1')
    MotionGlobalConfig.skipAnimations = true
    const { container } = render(
      <MotionProvider>
        <App />
      </MotionProvider>,
    )
    expect(container.querySelector('.preloader')).toBe(null)
    await waitFor(() =>
      expect(document.querySelector('.home__identity').style.filter).toBe(
        'none',
      ),
    )
    expect(
      document.querySelector('.flying-avatar__entrance').style.filter,
    ).toBe('none')
  })
})
