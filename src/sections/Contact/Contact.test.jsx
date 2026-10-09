import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UNPROTECTED_SPACE } from '../../data/rules.js'
import socials from '../../data/socials.json'
import { Contact } from './Contact.jsx'

// « Contact » : l'adresse e-mail en grand, mes profils et mon CV

const profile = vi.hoisted(() => ({
  name: 'Kevin Renou',
  job: 'Développeur front-end.',
  copyright: '© 2026',
  email: 'kevin@exemple.fr',
  cv: null,
}))
vi.mock('../../data/profile.json', () => ({ default: profile }))

const room = () => screen.getByRole('region', { name: /^Travaillons/ })

describe('Contact', () => {
  afterEach(() => {
    // remis à zéro même si un test échoue avant sa fin
    profile.email = 'kevin@exemple.fr'
  })

  it('est la pièce « contact », kraft, nommée par son titre', () => {
    render(<Contact />)
    expect(room()).toHaveAttribute('id', 'contact')
    expect(room()).toHaveAttribute('data-theme', 'paper-light')
    expect(room()).toHaveClass('room', 'contact')
    expect(room().firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--kraft',
    )
  })

  it('porte l’étiquette « 04 — Contact », l’accent et l’introduction', () => {
    render(<Contact />)
    expect(screen.getByText('04 — Contact')).toBeInTheDocument()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title.textContent).toBe('Travaillons ensemble.')
    expect(within(title).getByText('ensemble.')).toBeInTheDocument()
    // espace insécable avant « : » (le texte ne se coupe pas devant) ;
    // Testing Library normalise les espaces (\s couvre l'insécable) :
    // on lit le texte brut
    const lead = screen.getByText(/je réponds vite\.$/)
    expect(lead.textContent).toContain('question\u00a0:')
  })

  it.each(['kevin@exemple.fr', 'bonjour@kevin.dev'])(
    "écrit l'adresse %s en toutes lettres, en lien mailto",
    (email) => {
      // visible : sans logiciel de messagerie, on peut la copier (SMU)
      profile.email = email
      render(<Contact />)
      expect(screen.getByRole('link', { name: email })).toHaveAttribute(
        'href',
        `mailto:${email}`,
      )
      profile.email = 'kevin@exemple.fr'
    },
  )

  it.each(socials)(
    'mène à mon profil $name, dans un nouvel onglet',
    ({ name, href }) => {
      render(<Contact />)
      expect(
        screen.getByRole('link', { name: `${name} (nouvel onglet)` }),
      ).toHaveAttribute('href', href)
    },
  )

  it('ne laisse aucune espace sécable avant « : ; ! ? »', () => {
    const { container } = render(<Contact />)
    expect(container.textContent).not.toMatch(UNPROTECTED_SPACE)
  })

  it('propose le CV seulement si le PDF existe (CvButton.test.jsx)', () => {
    render(<Contact />)
    expect(screen.queryByText(/Télécharger mon CV/)).toBe(null)
  })
})
