import { act, render, screen, waitFor, within } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MotionProvider } from '../../animations/MotionProvider.jsx'
import menu from '../../data/menu.json'
import socials from '../../data/socials.json'
import { preferReducedMotion } from '../../testing/motion.js'
import { Home } from './Home.jsx'

// L'accueil : qui je suis (à gauche), le menu géant (à droite)

describe('Home', () => {
  it('est la pièce « home », nommée par mon nom en titre de niveau 1', () => {
    render(<Home />)
    const room = screen.getByRole('region', { name: 'Kevin Renou.' })
    expect(room).toHaveAttribute('id', 'home')
    expect(room).toHaveAttribute('data-theme', 'paper-light')
    expect(
      within(room).getByRole('heading', { level: 1, name: 'Kevin Renou.' }),
    ).toBeInTheDocument()
  })

  it('règle la pièce avec sa classe home (marges et pleine largeur)', () => {
    // sans ce mix, aucun test ne casse mais toute la mise en page de l'accueil disparaît
    render(<Home />)
    expect(screen.getByRole('region', { name: 'Kevin Renou.' })).toHaveClass(
      'room',
      'home',
    )
  })

  it("pose le papier kraft derrière la pièce, caché aux lecteurs d'écran", () => {
    render(<Home />)
    const room = screen.getByRole('region', { name: 'Kevin Renou.' })
    // premier enfant de la pièce : le fond, avant le contenu (Room)
    const background = room.firstElementChild
    expect(background).toHaveClass(
      'living-background--paper',
      'living-background--kraft',
    )
    expect(background).toHaveAttribute('aria-hidden', 'true')
  })

  it('dit mon métier', () => {
    render(<Home />)
    expect(screen.getByText('Développeur front-end.')).toBeInTheDocument()
  })

  it('montre mon portrait, décoratif puisque mon nom est écrit à côté', () => {
    const { container } = render(<Home />)
    const avatar = container.querySelector('img')
    expect(avatar).toHaveAttribute('alt', '')
    expect(avatar).toHaveAttribute('width', '104')
  })

  it('pose mon portrait dans l’emplacement de départ de l’avatar volant (§ 7.9)', () => {
    const { container } = render(<Home />)
    const slot = container.querySelector('[data-avatar-slot="home"]')
    expect(slot.querySelector('img')).toHaveAttribute('width', '104')
  })

  it.each(socials)('mène à mon profil $name', ({ name, href }) => {
    render(<Home />)
    const link = screen.getByRole('link', { name: `${name} (nouvel onglet)` })
    expect(link).toHaveAttribute('href', href)
  })

  it("a un menu principal : une ligne par pièce, numérotée, dans l'ordre", () => {
    render(<Home />)
    const nav = screen.getByRole('navigation', { name: 'Menu principal' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(
      menu.map(
        ({ label }, index) => `${label} ${String(index + 1).padStart(2, '0')}`,
      ),
    )
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      menu.map(({ id }) => `#${id}`),
    )
  })

  it('donne au menu principal l’id « menu » : la cible du lien « Menu » de la barre', () => {
    render(<Home />)
    expect(
      screen.getByRole('navigation', { name: 'Menu principal' }),
    ).toHaveAttribute('id', 'menu')
  })

  it('affiche « © 2026 »', () => {
    render(<Home />)
    expect(screen.getByText('© 2026')).toBeInTheDocument()
  })

  it("cache « Défiler » aux lecteurs d'écran : une indication pour les yeux", () => {
    render(<Home />)
    expect(
      screen.getByText('Défiler').closest('[aria-hidden="true"]'),
    ).not.toBe(null)
  })
})

// L'entrée de l'accueil (§ 7.4) : flou → net et 14 px de montée, jamais
// d'opacité (le LCP attendrait la fin de l'intro). Elle attend que l'intro
// rende la main (entered)
describe('Home — l’entrée', () => {
  it("pendant l'intro : bloc identité flou et 14 px plus bas, mais jamais transparent (LCP)", () => {
    render(<Home entered={false} />)
    const identity = document.querySelector('.home__identity')
    expect(identity.style.filter).toBe('blur(14px)')
    expect(identity.style.transform).toBe('translateY(14px)')
    expect(identity.style.opacity).toBe('')
    // les lignes du menu aussi, la dernière comprise
    const lines = document.querySelectorAll('.giant-menu li')
    expect(lines[0].style.filter).toBe('blur(14px)')
    expect(lines[lines.length - 1].style.filter).toBe('blur(14px)')
  })

  it('sous « réduire les animations » : en place d’emblée', () => {
    preferReducedMotion()
    render(<Home entered={false} />)
    expect(document.querySelector('.home__identity').style.filter).not.toBe(
      'blur(14px)',
    )
  })

  describe('moteur chargé', () => {
    // les animations finissent tout de suite (réglage de Motion pour les tests)
    beforeEach(() => {
      MotionGlobalConfig.skipAnimations = true
    })
    afterEach(() => {
      MotionGlobalConfig.skipAnimations = false
    })

    it('l’intro rend la main : l’accueil entre, et finit net', async () => {
      render(
        <MotionProvider>
          <Home entered />
        </MotionProvider>,
      )
      const identity = document.querySelector('.home__identity')
      // net, plus aucun filtre (unblur : transitionEnd)
      await waitFor(() => expect(identity.style.filter).toBe('none'))
      expect(identity.style.transform).toBe('none')
      const lines = document.querySelectorAll('.giant-menu li')
      expect(lines[lines.length - 1].style.filter).toBe('none')
    })

    it('tant que l’intro joue, il attend, même moteur chargé', async () => {
      const page = (entered) => (
        <MotionProvider>
          <Home entered={entered} />
        </MotionProvider>
      )
      const { rerender } = render(page(false))
      // le moteur, chargé après le premier rendu (import) : attendu pour de
      // bon — une attente au hasard laissait le test passer sans lui (revue)
      await vi.dynamicImportSettled()
      await act(async () => {})
      // puis deux images : Motion démarre une animation à l'image suivante
      await act(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      )
      const identity = document.querySelector('.home__identity')
      expect(identity.style.filter).toBe('blur(14px)')
      // contre-épreuve : le même accueil, la main rendue, entre bien
      rerender(page(true))
      await waitFor(() => expect(identity.style.filter).toBe('none'))
    })
  })
})
