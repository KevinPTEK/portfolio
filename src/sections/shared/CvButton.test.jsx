import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CvButton } from './CvButton.jsx'

// Le bouton du CV, partagé par « À propos » et « Contact » : caché tant que
// le PDF manque (profile.json : cv null), sinon un lien de téléchargement
// qui dit son format et son poids (GOV.UK)

const profile = vi.hoisted(() => ({ cv: null }))
vi.mock('../../data/profile.json', () => ({ default: profile }))

describe('CvButton', () => {
  afterEach(() => {
    // remis à zéro même si un test échoue avant sa fin
    profile.cv = null
  })

  it("n'affiche rien tant que le PDF manque", () => {
    const { container } = render(<CvButton />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each([
    ['/cv-kevin-renou.pdf', '92 Ko'],
    ['/resume.pdf', '140 Ko'],
  ])('télécharge %s, format et poids dans le libellé', (href, size) => {
    profile.cv = { href, size }
    render(<CvButton />)
    const link = screen.getByRole('link', { name: /Télécharger mon CV/ })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('download')
    expect(link).toHaveTextContent(`Télécharger mon CV (PDF, ${size})`)
  })

  it.each(['primary', 'ghost'])('prend la variante %s', (variant) => {
    profile.cv = { href: '/cv.pdf', size: '92 Ko' }
    render(<CvButton variant={variant} />)
    expect(screen.getByRole('link')).toHaveClass(`button--${variant}`)
  })
})
