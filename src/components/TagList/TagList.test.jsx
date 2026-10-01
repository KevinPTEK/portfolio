import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TagList } from './TagList.jsx'

// Exemple d'usage : les technologies d'un projet, tirées de projects.json
describe('TagList', () => {
  it('est une liste avec un élément par tag', () => {
    render(<TagList tags={['React', 'React Router', 'Sass']} />)
    const list = screen.getByRole('list')
    // happy-dom voit une liste même sans role="list" : on protège l'attribut pour Safari
    expect(list).toHaveAttribute('role', 'list')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it("affiche chaque tag dans l'ordre des données", () => {
    render(<TagList tags={['React', 'Redux', 'API REST']} />)
    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'React',
      'Redux',
      'API REST',
    ])
  })

  it("n'affiche rien sans tag", () => {
    const { container } = render(<TagList tags={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("n'affiche rien si les tags manquent dans les données", () => {
    const { container } = render(<TagList />)
    expect(container).toBeEmptyDOMElement()
  })
})
