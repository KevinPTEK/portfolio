import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import journey from '../../data/journey.json'
import { UNPROTECTED_SPACE } from '../../data/rules.js'
import { Journey } from './Journey.jsx'

// « Parcours » : une frise de la maintenance au code ; après le déclic, les
// étapes passent à la couleur d'accent

const room = () => screen.getByRole('region', { name: /^De la maintenance/ })
const steps = () => within(room()).getAllByRole('listitem')

describe('Journey', () => {
  it('est la pièce « journey », papier kraft, nommée par son titre', () => {
    render(<Journey />)
    expect(room()).toHaveAttribute('id', 'journey')
    expect(room()).toHaveAttribute('data-theme', 'paper-light')
    expect(room()).toHaveClass('room', 'journey')
    expect(room().firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--kraft',
    )
  })

  it('porte l’étiquette « 02 — Parcours » et la fin du titre en accent', () => {
    render(<Journey />)
    expect(screen.getByText('02 — Parcours')).toBeInTheDocument()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title.textContent).toBe('De la maintenance au code.')
    expect(within(title).getByText('au code.')).toBeInTheDocument()
  })

  it('range les étapes dans une liste ordonnée (role="list" pour Safari), dans l’ordre', () => {
    render(<Journey />)
    const list = within(room()).getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(journey.map((step) => step.title))
  })

  it.each(journey)(
    'montre la date et le type de « $title »',
    ({ title, date, kind }) => {
      render(<Journey />)
      const step = screen.getByRole('heading', { name: title }).closest('li')
      expect(within(step).getByText(date)).toBeInTheDocument()
      expect(within(step).getByText(kind)).toBeInTheDocument()
    },
  )

  // la couleur ne le dit pas seule : l'étape du déclic porte aussi son type
  it('marque le déclic et les étapes qui le suivent, pas celles d’avant', () => {
    render(<Journey />)
    const turn = journey.findIndex((step) => step.turningPoint)
    expect(turn).toBeGreaterThan(0)
    const marks = steps().map((step) => [
      step.classList.contains('journey__step--turn'),
      step.classList.contains('journey__step--after'),
    ])
    expect(marks).toEqual(
      journey.map((_, index) => [index === turn, index > turn]),
    )
  })

  it('protège les « : » par une espace insécable', () => {
    const { container } = render(<Journey />)
    expect(container.textContent).not.toMatch(UNPROTECTED_SPACE)
  })
})
