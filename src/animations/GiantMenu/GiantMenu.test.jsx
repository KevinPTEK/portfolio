import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GiantMenu } from './GiantMenu.jsx'

// Exemple d'usage : le menu de l'accueil, une ligne par pièce
const items = [
  { label: 'À propos', href: '#about', number: '01' },
  { label: 'Travaux', href: '#work', number: '02' },
  { label: 'Compétences', href: '#skills', number: '03' },
]

describe('GiantMenu', () => {
  it('est une liste avec une ligne par pièce', () => {
    render(<GiantMenu items={items} />)
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    // happy-dom voit une liste même sans role="list" : on protège l'attribut pour Safari
    expect(list).toHaveAttribute('role', 'list')
  })

  it('nomme chaque ligne (giant-menu__item : ses filets de l’entrée)', () => {
    render(<GiantMenu items={items} />)
    for (const line of screen.getAllByRole('listitem')) {
      expect(line).toHaveClass('giant-menu__item')
    }
  })

  it.each(items)(
    'mène à $href, nommé par son libellé et son numéro',
    ({ label, href, number }) => {
      render(<GiantMenu items={items} />)
      const link = screen.getByRole('link', { name: `${label} ${number}` })
      expect(link).toHaveAttribute('href', href)
      // le texte exact (happy-dom ajoute de lui-même une espace dans le nom accessible)
      expect(link.textContent).toBe(`${label} ${number}`)
    },
  )

  it("garde l'ordre des pièces", () => {
    render(<GiantMenu items={items} />)
    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['#about', '#work', '#skills'])
  })

  it("n'écrit chaque libellé qu'une fois (aucun calque, aucun data-label)", () => {
    const { container } = render(<GiantMenu items={items} />)
    expect(container.querySelector('[data-label]')).toBe(null)
    expect(container.textContent).toBe('À propos 01Travaux 02Compétences 03')
  })

  it('sans pièce, ne rend rien', () => {
    const { container } = render(<GiantMenu items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sans la prop items, ne plante pas et ne rend rien', () => {
    // la valeur par défaut items = [] : sans elle, items.length planterait
    const { container } = render(<GiantMenu />)
    expect(container).toBeEmptyDOMElement()
  })
})
