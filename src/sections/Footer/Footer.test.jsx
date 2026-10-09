import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import profile from '../../data/profile.json'
import { Footer } from './Footer.jsx'

// Le pied de page : après <main>, le seul repère « contentinfo » (APG)

describe('Footer', () => {
  it('est le repère contentinfo de la page, au kraft de Contact', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveAttribute('data-theme', 'paper-light')
    // le papier kraft derrière lui, comme « Contact »
    expect(footer.firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--kraft',
    )
  })

  it('signe la page : « © 2026 Kevin Renou »', () => {
    render(<Footer />)
    expect(
      screen.getByText(`${profile.copyright} ${profile.name}`),
    ).toBeInTheDocument()
  })

  it('ramène en haut de page, au contenu (focalisable : le focus suit)', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Haut de page' })).toHaveAttribute(
      'href',
      '#main',
    )
  })
})
