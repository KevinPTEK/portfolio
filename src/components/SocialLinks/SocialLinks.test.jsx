import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from '../Icon/Icon.jsx'
import { SocialLinks } from './SocialLinks.jsx'

// Exemple d'usage : les profils de l'accueil, tirés de socials.json
const links = [
  { name: 'GitHub', href: 'https://github.com/KevinPTEK' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kevin-renou' },
]

describe('SocialLinks', () => {
  it('est une liste avec un élément par profil', () => {
    render(<SocialLinks links={links} />)
    const list = screen.getByRole('list')
    // happy-dom voit une liste même sans role="list" : on protège l'attribut pour Safari
    expect(list).toHaveAttribute('role', 'list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  // it.each répète le test pour chaque profil ; $name reprend le champ name
  it.each(links)(
    'mène à $name dans un nouvel onglet annoncé',
    ({ name, href }) => {
      render(<SocialLinks links={links} />)
      const link = screen.getByRole('link', { name: `${name} (nouvel onglet)` })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'me noopener')
    },
  )

  it("montre l'icône ↗ dans chaque lien", () => {
    // tracé de référence : celui d'Icon, sans le recopier ici
    const { container } = render(<Icon name="external" />)
    const external = container.querySelector('path').getAttribute('d')
    render(<SocialLinks links={links} />)
    for (const link of screen.getAllByRole('link')) {
      expect(link.querySelector('path')).toHaveAttribute('d', external)
    }
  })

  it('reçoit la classe de son parent (mix BEM)', () => {
    render(<SocialLinks links={links} className="home__links" />)
    expect(screen.getByRole('list')).toHaveClass('social-links', 'home__links')
  })

  it("sans classe du parent, n'a que la sienne", () => {
    render(<SocialLinks links={links} />)
    expect(screen.getByRole('list')).toHaveAttribute('class', 'social-links')
  })

  it("n'affiche rien sans profil", () => {
    const { container } = render(<SocialLinks />)
    expect(container).toBeEmptyDOMElement()
  })
})
