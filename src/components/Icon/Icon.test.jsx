import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon.jsx'

const NAMES = ['arrow', 'external', 'download', 'close']

// Exemple d'usage : la flèche d'un bouton, placée par la classe du bouton
describe('Icon', () => {
  // l'icône est cachée aux lecteurs d'écran : getByRole ne peut pas la trouver,
  // on la cherche donc par sa balise
  it("est cachée aux lecteurs d'écran", () => {
    const { container } = render(<Icon name="arrow" />)
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('reçoit la classe de son parent (mix BEM)', () => {
    const { container } = render(<Icon name="arrow" className="button__icon" />)
    expect(container.querySelector('svg')).toHaveClass('icon', 'button__icon')
  })

  it("n'affiche rien pour un nom inconnu", () => {
    const { container } = render(<Icon name="inconnue" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("sans classe du parent, n'a que la sienne", () => {
    const { container } = render(<Icon name="arrow" />)
    expect(container.querySelector('svg')).toHaveAttribute('class', 'icon')
  })

  it.each(NAMES)("dessine l'icône %s", (name) => {
    const { container } = render(<Icon name={name} />)
    expect(container.querySelector('path')).toHaveAttribute('d')
  })

  // un tracé copié d'une autre icône passerait le test précédent
  it('chaque icône a son propre tracé', () => {
    const paths = NAMES.map((name) => {
      const { container } = render(<Icon name={name} />)
      return container.querySelector('path').getAttribute('d')
    })
    expect(new Set(paths).size).toBe(NAMES.length)
  })

  it("n'affiche rien pour un nom hérité d'Object", () => {
    const { container } = render(<Icon name="constructor" />)
    expect(container).toBeEmptyDOMElement()
  })
})
