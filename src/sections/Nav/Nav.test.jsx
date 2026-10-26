import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import menu from '../../data/menu.json'
import socials from '../../data/socials.json'
import { Nav } from './Nav.jsx'

// La nav fixe (sa mise en page se vérifie dans le navigateur)

const sections = () => screen.getByRole('navigation', { name: 'Sections' })

describe('Nav', () => {
  it('est la bannière du site, avec un repère de navigation « Sections »', () => {
    // nom différent du « Menu principal » de l'accueil : deux repères de
    // navigation doivent se distinguer, sans le mot « navigation » (APG)
    render(<Nav />)
    expect(
      within(screen.getByRole('banner')).getByRole('navigation', {
        name: 'Sections',
      }),
    ).toBeInTheDocument()
  })

  it("mène à chaque pièce du menu, numérotée, dans l'ordre", () => {
    render(<Nav />)
    const links = within(sections()).getAllByRole('link')
    // le numéro devant : le nom suit l'ordre visible (WCAG 2.5.3)
    expect(links.map((link) => link.textContent)).toEqual(
      menu.map(
        ({ label }, index) => `${String(index + 1).padStart(2, '0')} ${label}`,
      ),
    )
    // happy-dom voit une liste même sans role="list" : on protège l'attribut pour Safari
    expect(within(sections()).getByRole('list')).toHaveAttribute('role', 'list')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      menu.map(({ id }) => `#${id}`),
    )
  })

  it.each(['work', 'contact'])(
    'marque la section « %s » comme emplacement courant, elle seule',
    (id) => {
      render(<Nav currentSection={id} />)
      const current = within(sections())
        .getAllByRole('link')
        .filter((link) => link.hasAttribute('aria-current'))
      expect(current).toHaveLength(1)
      expect(current[0]).toHaveAttribute('href', `#${id}`)
      // location : un emplacement dans la page, pas une autre page (MDN)
      expect(current[0]).toHaveAttribute('aria-current', 'location')
    },
  )

  it('ne marque rien hors du menu (accueil)', () => {
    render(<Nav currentSection={null} />)
    for (const link of within(sections()).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })

  it.each([
    [true, true],
    [false, false],
  ])('masquée : %s → classe nav--hidden : %s', (hidden, expected) => {
    render(<Nav isHidden={hidden} />)
    expect(
      screen
        .getByRole('banner', { hidden: true })
        .classList.contains('nav--hidden'),
    ).toBe(expected)
  })

  // l'arrivée sur la page : les couleurs de la pièce d'emblée
  it.each([
    [true, true],
    [false, false],
  ])('arrivée : %s → classe nav--arriving : %s', (arriving, expected) => {
    render(<Nav isHidden isArriving={arriving} />)
    const banner = screen.getByRole('banner', { hidden: true })
    expect(banner.classList.contains('nav--arriving')).toBe(expected)
    expect(banner).toHaveClass('nav', 'nav--hidden') // les deux modificateurs ensemble
  })

  it('a quatre enfants, dans l’ordre de la cascade (Nav.scss les vise par leur rang)', () => {
    // identité, pièces, « Menu », © : un enfant ajouté décalerait la cascade
    render(<Nav />)
    expect(
      [...screen.getByRole('banner').children].map(
        ({ className }) => className,
      ),
    ).toEqual([
      'nav__identity',
      'nav__sections',
      'nav__menu-link',
      'nav__copyright',
    ])
  })

  it("ramène au haut de l'accueil par mon nom, portrait décoratif", () => {
    render(<Nav />)
    // happy-dom ajoute une espace avant le <span> du point dans le nom
    // accessible (« Kevin Renou . ») : on vérifie le texte, exact
    const brand = screen.getByRole('link', { name: /^Kevin Renou/ })
    expect(brand.textContent).toBe('Kevin Renou.')
    expect(brand).toHaveAttribute('href', '#home')
    expect(brand.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('pose son portrait dans l’emplacement d’arrivée de l’avatar volant', () => {
    render(<Nav />)
    const brand = screen.getByRole('link', { name: /^Kevin Renou/ })
    const slot = brand.querySelector('[data-avatar-slot="nav"]')
    expect(slot).toHaveClass('nav__avatar')
    expect(slot.querySelector('img')).toHaveAttribute('width', '56')
  })

  it('ramène au menu géant par « Menu » (barre mobile)', () => {
    render(<Nav />)
    // masqué à 1 024 px (la fenêtre de happy-dom) : trouvé par son texte
    const link = screen.getByText('Menu')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '#menu')
  })

  it('dit mon métier, mes profils et « © 2026 » (colonne de bureau)', () => {
    render(<Nav />)
    expect(screen.getByText('Développeur front-end.')).toBeInTheDocument()
    expect(screen.getByText('© 2026')).toBeInTheDocument()
    for (const { name, href } of socials) {
      expect(
        screen.getByRole('link', { name: `${name} (nouvel onglet)` }),
      ).toHaveAttribute('href', href)
    }
  })
})
