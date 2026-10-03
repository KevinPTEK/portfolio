import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

  it('mène à chaque profil dans un nouvel onglet annoncé', () => {
    render(<SocialLinks links={links} />)
    const link = screen.getByRole('link', { name: 'GitHub (nouvel onglet)' })
    expect(link).toHaveAttribute('href', 'https://github.com/KevinPTEK')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'me noopener')
  })

  it("montre l'icône ↗ dans chaque lien", () => {
    render(<SocialLinks links={links} />)
    for (const link of screen.getAllByRole('link')) {
      expect(link.querySelector('svg')).toBeInTheDocument()
    }
  })

  it('reçoit la classe de son parent (mix BEM)', () => {
    render(<SocialLinks links={links} className="home__links" />)
    expect(screen.getByRole('list')).toHaveClass('social-links', 'home__links')
  })

  it("n'affiche rien sans profil", () => {
    const { container } = render(<SocialLinks />)
    expect(container).toBeEmptyDOMElement()
  })
})
