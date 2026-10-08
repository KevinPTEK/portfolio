import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import projects from '../../data/projects.json'
import { Work } from './Work.jsx'

// Les travaux : une pièce par projet de projects.json, et la modale de détail.
// happy-dom ouvre et ferme bien un <dialog>, mais ne gère ni Échap ni le focus
// initial : ceux-là se vérifient dans le navigateur (§ 9).

function openProject(user, name) {
  return user.click(
    screen.getByRole('button', { name: `Voir le projet ${name}` }),
  )
}

describe('Work', () => {
  it('est la cible #work du menu', () => {
    const { container } = render(<Work />)
    expect(container.querySelector('#work')).not.toBe(null)
  })

  it.each(projects)(
    'donne une pièce à $name, nommée par son titre, à ses couleurs',
    (project) => {
      render(<Work />)
      const room = document.getElementById(project.id)
      expect(room).toHaveAttribute('data-theme', project.theme)
      expect(room).toHaveAttribute('aria-labelledby', `${project.id}-title`)
      // le mix qui porte l'empilement (sans lui, aucun autre test ne casse)
      expect(room).toHaveClass('room', 'work__project')
      expect(within(room).getByRole('heading', { level: 2 }).textContent).toBe(
        project.title,
      )
    },
  )

  it("garde les projets dans l'ordre de projects.json, puis les autres réalisations", () => {
    render(<Work />)
    const ids = [...document.querySelectorAll('section')].map((room) => room.id)
    expect(ids).toEqual([
      ...projects.map((project) => project.id),
      'other-work',
    ])
    // dans #work : le menu « Travaux » mène aux projets comme aux autres réalisations
    expect(document.querySelector('#work #other-work')).not.toBe(null)
  })

  it('garde la modale montée, fermée, avant toute ouverture', () => {
    // démontée pendant qu'elle est ouverte, elle ne préviendrait pas le parent (§ 9)
    render(<Work />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBe(null)
    expect(dialog.open).toBe(false)
  })

  it('ouvre le détail du projet choisi, à ses couleurs', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const [, second] = projects
    await openProject(user, second.name)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    const title = within(dialog).getByRole('heading', { level: 2 })
    expect(title.textContent).toBe(second.title)
    // le titre nomme la modale, par un id qui n'existe qu'une fois dans la page
    // (repris de la carte, il pointerait d'abord sur le titre de la carte)
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
    expect(document.querySelectorAll(`[id="${title.id}"]`)).toHaveLength(1)
    // sa place, dans la carte comme dans la modale (le 2e : « 02 », pas « 01 » ni « 03 »)
    const room = document.getElementById(second.id)
    const position = `02 / ${String(projects.length).padStart(2, '0')}`
    expect(within(room).getByText(position)).toBeInTheDocument()
    expect(within(dialog).getByText(position)).toBeInTheDocument()
    // à l'ouverture, le focus est sur « Fermer » (pas sur le titre)
    expect(within(dialog).getByRole('button', { name: 'Fermer' })).toHaveFocus()
  })

  it('« Projet suivant » montre le suivant et place le focus sur son titre', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const [first, second] = projects
    await openProject(user, first.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${second.name}` }),
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    const title = within(dialog).getByRole('heading', { level: 2 })
    expect(title.textContent).toBe(second.title)
    expect(title).toHaveFocus()
  })

  it('après le dernier projet, « Projet suivant » revient au premier', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const first = projects[0]
    const last = projects.at(-1)
    await openProject(user, last.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${first.name}` }),
    )
    expect(
      within(screen.getByRole('dialog')).getByRole('heading', { level: 2 })
        .textContent,
    ).toBe(first.title)
  })

  it('à la fermeture, rend le focus au bouton du projet affiché', async () => {
    // Safari ne donne pas le focus à un bouton cliqué : le navigateur ne peut
    // pas le rendre seul (§ 9). Après « Projet suivant », c'est le bouton du
    // projet affiché, pas celui du départ.
    const user = userEvent.setup()
    render(<Work />)
    const [first, second] = projects
    await openProject(user, first.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${second.name}` }),
    )
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(document.querySelector('dialog').open).toBe(false)
    expect(
      screen.getByRole('button', { name: `Voir le projet ${second.name}` }),
    ).toHaveFocus()
  })

  it('fermée, la modale garde le projet affiché (pas de saut de contenu)', async () => {
    // une sortie animée (étape 4) montrerait sinon le 1er projet en se fermant
    const user = userEvent.setup()
    render(<Work />)
    const [, second] = projects
    await openProject(user, second.name)
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(false)
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    expect(dialog.querySelector('h2').textContent).toBe(second.title)
  })
})
