import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OtherWork } from './OtherWork.jsx'

// Deux sites inventés : avec le seul Tourn&Marou, un ordre inversé ou un 2e
// site oublié passeraient inaperçus. Modifiables (hoisted) : un test retire le
// 2e site
const data = vi.hoisted(() => ({
  sites: [
    {
      id: 'atelier',
      name: 'Atelier Lune',
      summary: "Le site vitrine d'un atelier de céramique.",
      tags: ['HTML', 'Sass'],
      links: { site: 'https://atelier-lune.example/' },
      cover: { src: '/images/atelier-cover.webp', alt: 'Atelier Lune' },
    },
    {
      id: 'fournee',
      name: 'La Fournée',
      summary: "Le site d'une boulangerie de quartier.",
      tags: ['Astro'],
      links: { site: 'https://la-fournee.example/' },
      cover: { src: '/images/fournee-cover.webp', alt: 'La Fournée' },
    },
  ],
}))
vi.mock('../../data/sites.json', () => ({ default: data.sites }))

describe('OtherWork', () => {
  it('est une pièce kraft, nommée par son titre', () => {
    render(<OtherWork />)
    const room = screen.getByRole('region', { name: 'Autres réalisations.' })
    expect(room).toHaveAttribute('id', 'other-work')
    expect(room).toHaveAttribute('data-theme', 'paper-light')
    // le bloc BEM de la section, mêlé à la pièce (comme home et work__project)
    expect(room).toHaveClass('room', 'other-work')
  })

  it('pose le papier kraft derrière la pièce', () => {
    render(<OtherWork />)
    const room = screen.getByRole('region', { name: 'Autres réalisations.' })
    expect(room.firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--kraft',
    )
  })

  it("affiche l'étiquette, le titre avec son accent et l'introduction", () => {
    render(<OtherWork />)
    expect(screen.getByText('Et aussi')).toBeInTheDocument()
    // « réalisations. » seul dans son élément : l'accent est bien posé
    const title = screen.getByRole('heading', { level: 2 })
    expect(within(title).getByText('réalisations.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Des sites vitrines intégrés pour des clients, en ligne.',
      ),
    ).toBeInTheDocument()
  })

  // l'introduction suit le nombre de sites
  it('introduit un seul site au singulier', () => {
    const removed = data.sites.splice(1)
    try {
      render(<OtherWork />)
      expect(
        screen.getByText('Un site vitrine intégré pour un client, en ligne.'),
      ).toBeInTheDocument()
    } finally {
      data.sites.push(...removed)
    }
  })

  it("donne une carte à chaque site, dans l'ordre de sites.json", () => {
    render(<OtherWork />)
    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(names).toEqual(['Atelier Lune', 'La Fournée'])
  })

  it('range les cartes dans une seule liste', () => {
    // annoncée « liste, 2 éléments » : on sait combien de sites suivent
    render(<OtherWork />)
    const items = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.closest('li'))
    const lists = new Set(items.map((item) => item?.parentElement))
    expect(lists.size).toBe(1)
    const [list] = lists
    expect(list.tagName).toBe('UL')
    // happy-dom voit une liste même sans role="list" : on protège l'attribut pour Safari
    expect(list).toHaveAttribute('role', 'list')
  })
})
