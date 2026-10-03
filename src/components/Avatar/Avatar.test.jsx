import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar.jsx'

// Exemple d'usage : l'avatar du bloc identité de l'accueil
describe('Avatar', () => {
  it('affiche une image avec son texte alternatif', () => {
    render(<Avatar src="/avatar.webp" alt="Kevin Renou" size={104} />)
    expect(screen.getByRole('img', { name: 'Kevin Renou' })).toBeInTheDocument()
  })

  it('réserve sa place à la taille demandée', () => {
    render(<Avatar src="/avatar.webp" alt="Kevin Renou" size={104} />)
    const image = screen.getByRole('img', { name: 'Kevin Renou' })
    expect(image).toHaveAttribute('width', '104')
    expect(image).toHaveAttribute('height', '104')
  })

  it('propose plusieurs résolutions et indique la taille affichée', () => {
    render(
      <Avatar
        src="/avatar-256.webp"
        srcSet="/avatar-128.webp 128w, /avatar-256.webp 256w"
        alt="Kevin Renou"
        size={56}
      />,
    )
    const image = screen.getByRole('img', { name: 'Kevin Renou' })
    expect(image).toHaveAttribute(
      'srcset',
      '/avatar-128.webp 128w, /avatar-256.webp 256w',
    )
    expect(image).toHaveAttribute('sizes', '56px')
  })

  it("sans srcSet, n'indique pas de taille au navigateur", () => {
    render(<Avatar src="/avatar.webp" alt="Kevin Renou" size={56} />)
    const image = screen.getByRole('img', { name: 'Kevin Renou' })
    expect(image).not.toHaveAttribute('sizes')
  })

  it('peut se charger en différé', () => {
    render(
      <Avatar src="/avatar.webp" alt="Kevin Renou" size={104} loading="lazy" />,
    )
    const image = screen.getByRole('img', { name: 'Kevin Renou' })
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('devient décorative avec un texte alternatif vide', () => {
    render(<Avatar src="/avatar.webp" alt="" size={56} />)
    // alt="" : l'image sort de l'arbre d'accessibilité (rôle presentation)
    expect(screen.getByRole('presentation')).toHaveAttribute('alt', '')
  })
})
