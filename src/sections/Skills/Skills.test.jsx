import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import projects from '../../data/projects.json'
import sites from '../../data/sites.json'
import { UNPROTECTED_SPACE } from '../../data/rules.js'
import skills from '../../data/skills.json'
import { Skills } from './Skills.jsx'

// « Compétences » : une carte par famille, une ligne par compétence (niveau
// ●●○ et, s'il en a une, le projet qui la montre)

const room = () => screen.getByRole('region', { name: /^Compétences/ })
const items = skills.flatMap((group) => group.items)

describe('Skills', () => {
  it('est la pièce « skills », papier froid, nommée par son titre', () => {
    render(<Skills />)
    expect(room()).toHaveAttribute('id', 'skills')
    expect(room()).toHaveAttribute('data-theme', 'paper-cool')
    expect(room()).toHaveClass('room', 'skills')
    expect(room().firstElementChild).toHaveClass(
      'living-background--paper',
      'living-background--cool',
    )
  })

  it("porte l'étiquette « 03 — Compétences », l'accent et la légende des niveaux", () => {
    render(<Skills />)
    expect(screen.getByText('03 — Compétences')).toBeInTheDocument()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title.textContent).toBe('Compétences, honnêtement.')
    expect(within(title).getByText('honnêtement.')).toBeInTheDocument()
    // la légende : l'étalon des niveaux, sans lequel ●●○ ne dit rien
    expect(
      screen.getByText(/^Trois points \(niveau 3 sur 3\)/),
    ).toBeInTheDocument()
  })

  it('donne un titre de niveau 3 à chaque famille, dans l’ordre', () => {
    render(<Skills />)
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(skills.map((group) => group.group))
  })

  it('range familles et compétences dans des listes (role="list" pour Safari)', () => {
    render(<Skills />)
    const lists = room().querySelectorAll('ul')
    // une liste des familles + une par famille
    expect(lists).toHaveLength(skills.length + 1)
    for (const list of lists) expect(list).toHaveAttribute('role', 'list')
  })

  it.each(items)(
    'montre « $name » au niveau $level sur 3',
    ({ name, level }) => {
      render(<Skills />)
      const item = screen.getByText(name).closest('li')
      expect(
        within(item).getByRole('img', { name: `niveau ${level} sur 3` }),
      ).toBeInTheDocument()
    },
  )

  it.each(items.filter((item) => item.proof))(
    'relie « $name » au projet qui la montre',
    ({ name, proof }) => {
      render(<Skills />)
      const item = screen.getByText(name).closest('li')
      const link = within(item).getByRole('link')
      // un projet : sa propre pièce ; un site : la pièce « Autres réalisations »
      const project = projects.find((work) => work.id === proof)
      const site = sites.find((work) => work.id === proof)
      expect(link).toHaveAttribute(
        'href',
        project ? `#${project.id}` : '#other-work',
      )
      expect(link).toHaveTextContent((project ?? site).name)
    },
  )

  it.each(items.filter((item) => item.detail))(
    'précise « $name » : $detail',
    ({ name, detail }) => {
      render(<Skills />)
      const item = screen.getByText(name).closest('li')
      expect(within(item).getByText(detail)).toBeInTheDocument()
    },
  )

  it('annonce chaque preuve par « Vu dans »', () => {
    render(<Skills />)
    for (const link of room().querySelectorAll('.skills__proof a')) {
      expect(link.parentElement.textContent).toBe(`Vu dans ${link.textContent}`)
    }
  })

  it('ne laisse aucune espace sécable avant « : ; ! ? »', () => {
    const { container } = render(<Skills />)
    expect(container.textContent).not.toMatch(UNPROTECTED_SPACE)
  })

  it('ne met aucun lien sous une compétence sans preuve', () => {
    render(<Skills />)
    for (const { name } of items.filter((item) => !item.proof)) {
      const item = screen.getByText(name).closest('li')
      expect(within(item).queryByRole('link')).toBe(null)
    }
  })
})
