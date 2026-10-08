import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkipLink } from './SkipLink.jsx'

// Le lien d'évitement : premier élément focalisable de la page, invisible
// jusqu'au focus clavier (son affichage se vérifie dans le navigateur)

describe('SkipLink', () => {
  // deux jeux de valeurs : une cible écrite en dur ne peut pas passer deux fois
  it.each([
    ['#main', 'Aller au contenu'],
    ['#contact', 'Aller au contact'],
  ])('mène à %s, nommé par son texte', (href, text) => {
    render(<SkipLink href={href}>{text}</SkipLink>)
    expect(screen.getByRole('link', { name: text })).toHaveAttribute(
      'href',
      href,
    )
  })

  it('porte sa classe (masqué hors du focus)', () => {
    render(<SkipLink href="#main">Aller au contenu</SkipLink>)
    expect(screen.getByRole('link')).toHaveClass('skip-link')
  })
})
