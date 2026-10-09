import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { avatar } from '../../assets/images/avatar.js'
import profile from '../../data/profile.json'
import { UNPROTECTED_SPACE } from '../../data/rules.js'
import socials from '../../data/socials.json'
import { About } from './About.jsx'

// « À propos » : qui je suis, en trois paragraphes, avec mon portrait,
// LinkedIn et mon CV (le bouton du CV est testé par CvButton.test.jsx)

const room = () => screen.getByRole('region', { name: /^Bonjour/ })

describe('About', () => {
  it('est la pièce « about », papier froid, nommée par son titre', () => {
    render(<About />)
    expect(room()).toHaveAttribute('id', 'about')
    expect(room()).toHaveAttribute('data-theme', 'paper-cool')
    expect(room()).toHaveClass('room', 'about')
    // le papier froid derrière la pièce
    expect(room().firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--cool',
    )
  })

  it('porte l’étiquette « 01 — À propos » et le prénom en accent', () => {
    render(<About />)
    expect(screen.getByText('01 — À propos')).toBeInTheDocument()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title.textContent).toBe("Bonjour, moi c'est Kevin.")
    expect(within(title).getByText('Kevin.')).toBeInTheDocument()
  })

  it('se présente en trois paragraphes, sans espace sécable avant « : »', () => {
    const { container } = render(<About />)
    expect(room().querySelectorAll('.about__paragraph')).toHaveLength(3)
    // la règle des données (rules.js), sur le texte rendu du JSX
    expect(container.textContent).not.toMatch(UNPROTECTED_SPACE)
  })

  it('pose mon portrait, décoratif, sur son reflet pré-flouté', () => {
    render(<About />)
    const reflection = room().querySelector('.about__reflection')
    const portrait = room().querySelector('.about__avatar img')
    // le reflet : la petite image floutée, pas le portrait net agrandi
    expect(reflection).toHaveAttribute('src', avatar.blur)
    expect(portrait).toHaveAttribute('src', avatar.src)
    // décoratifs : mon prénom est le titre
    for (const image of [reflection, portrait]) {
      expect(image).toHaveAttribute('alt', '')
    }
    // sous l'accueil : chargé en différé
    expect(portrait).toHaveAttribute('loading', 'lazy')
  })

  it('mène à LinkedIn, dans un nouvel onglet', () => {
    render(<About />)
    const linkedin = socials.find(({ name }) => name === 'LinkedIn')
    expect(
      screen.getByRole('link', { name: 'LinkedIn (nouvel onglet)' }),
    ).toHaveAttribute('href', linkedin.href)
  })

  it('propose le CV seulement si le PDF existe (profile.json)', () => {
    render(<About />)
    expect(Boolean(screen.queryByText(/Télécharger mon CV/))).toBe(
      Boolean(profile.cv),
    )
  })
})
