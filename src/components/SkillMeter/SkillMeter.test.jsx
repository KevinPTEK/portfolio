import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkillMeter } from './SkillMeter.jsx'

// Exemple d'usage : une compétence de skills.json
describe('SkillMeter', () => {
  it('annonce le niveau sous forme de texte', () => {
    render(<SkillMeter name="React" level={2} />)
    // les points sont une image, nommée par son niveau
    expect(
      screen.getByRole('img', { name: 'niveau 2 sur 3' }),
    ).toBeInTheDocument()
  })

  it('accepte une autre échelle que 3', () => {
    render(<SkillMeter name="React" level={4} max={5} />)
    const meter = screen.getByRole('img', { name: 'niveau 4 sur 5' })
    // autant de points que max
    expect(meter.children).toHaveLength(5)
  })

  // revue générale (19 oct.) : seul le nombre de points était testé — un
  // niveau décalé d'un cran ou tous les points pleins passaient. C'est le cœur
  // de « le niveau de novice dit clairement » (guide OpenClassrooms)
  it.each([
    [2, 3, [true, true, false]],
    [4, 5, [true, true, true, true, false]],
  ])('remplit les %i premiers points sur %i', (level, max, expected) => {
    render(<SkillMeter name="React" level={level} max={max} />)
    const meter = screen.getByRole('img', {
      name: `niveau ${level} sur ${max}`,
    })
    const filled = [...meter.children].map((dot) =>
      dot.classList.contains('skill-meter__dot--filled'),
    )
    expect(filled).toEqual(expected)
  })

  it('affiche le nom de la compétence', () => {
    render(<SkillMeter name="React" level={2} />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('affiche le détail quand il est fourni', () => {
    render(<SkillMeter name="React" detail="Hooks, Router" level={2} />)
    expect(screen.getByText('Hooks, Router')).toBeInTheDocument()
  })
})
