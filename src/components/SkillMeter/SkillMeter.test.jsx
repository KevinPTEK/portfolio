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

  it('affiche le nom de la compétence', () => {
    render(<SkillMeter name="React" level={2} />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('affiche le détail quand il est fourni', () => {
    render(<SkillMeter name="React" detail="Hooks, Router" level={2} />)
    expect(screen.getByText('Hooks, Router')).toBeInTheDocument()
  })
})
