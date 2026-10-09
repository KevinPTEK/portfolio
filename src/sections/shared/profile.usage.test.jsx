import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Footer } from '../Footer/Footer.jsx'
import { Home } from '../Home/Home.jsx'
import { Nav } from '../Nav/Nav.jsx'

// Nom, métier et « © » viennent de profile.json, pas d'un texte écrit en dur :
// avec un autre profil, chaque pièce doit le suivre (sinon la centralisation
// se défait sans qu'aucun test ne le voie)

vi.mock('../../data/profile.json', () => ({
  default: {
    name: 'Ada Lovelace',
    job: 'Analyste.',
    copyright: '© 1843',
    email: 'ada@exemple.fr',
    cv: null,
  },
}))

describe('profile.json, lu par les pièces', () => {
  it("l'accueil : nom, métier et ©", () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ada Lovelace.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Analyste.')).toBeInTheDocument()
    expect(screen.getByText('© 1843')).toBeInTheDocument()
  })

  it('la nav : nom, métier et ©', () => {
    render(<Nav />)
    expect(
      screen.getByRole('link', { name: /^Ada Lovelace/ }).textContent,
    ).toBe('Ada Lovelace.')
    expect(screen.getByText('Analyste.')).toBeInTheDocument()
    expect(screen.getByText('© 1843')).toBeInTheDocument()
  })

  it('le pied de page : © et nom', () => {
    render(<Footer />)
    expect(screen.getByText('© 1843 Ada Lovelace')).toBeInTheDocument()
  })
})
