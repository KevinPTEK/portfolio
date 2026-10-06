import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import menu from '../../data/menu.json'
import socials from '../../data/socials.json'
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
