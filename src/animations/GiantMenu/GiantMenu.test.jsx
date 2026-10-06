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
    // happy-dom voit une liste même sans role="list" ; Safari, lui, ne l'annonce
    // plus comme une liste quand ses puces sont retirées (§ 10) : on vérifie l'attribut
    expect(list).toHaveAttribute('role', 'list')
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

  it('donne au calque italique le libellé de chaque ligne', () => {
    // le CSS dessine le mot en italique avec attr(data-label) : un seul mot dans le HTML
    render(<GiantMenu items={items} />)
    const words = screen
      .getAllByRole('link')
      .map((link) => link.querySelector('[data-label]').dataset.label)
    expect(words).toEqual(['À propos', 'Travaux', 'Compétences'])
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
