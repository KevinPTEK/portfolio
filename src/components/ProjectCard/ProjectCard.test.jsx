import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProjectCard } from './ProjectCard.jsx'

// Exemple d'usage : la pièce de Kasa, deuxième de trois
const project = {
  id: 'kasa',
  title: 'Kasa',
  accentWord: '— location.',
  summary: 'Application de location immobilière.',
  tags: ['React', 'React Router', 'Sass'],
  cover: { src: '/images/kasa-cover.webp', alt: "Page d'accueil de Kasa" },
}

function renderCard(props) {
  return render(
    <ProjectCard
      project={project}
      titleId="kasa-title"
      index={1}
      total={3}
      onOpen={() => {}}
      {...props}
    />,
  )
}

describe('ProjectCard', () => {
  it("titre de niveau 2 avec le mot en accent et l'id de la pièce", () => {
    renderCard()
    const title = screen.getByRole('heading', {
      level: 2,
      name: 'Kasa — location.',
    })
    expect(title).toHaveAttribute('id', 'kasa-title')
  })

  it('affiche sa place parmi les projets, sur deux chiffres', () => {
    renderCard()
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
  })

  it('affiche le résumé et une pastille par technologie', () => {
    renderCard()
    expect(
      screen.getByText('Application de location immobilière.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('ouvre ce projet au clic sur « Voir le projet »', async () => {
    const user = userEvent.setup()
    const handleOpen = vi.fn()
    renderCard({ onOpen: handleOpen })
    // le nom du projet, masqué, distingue les trois boutons
    const button = screen.getByRole('button', { name: 'Voir le projet Kasa' })
    // la flèche → de la maquette
    expect(button.querySelector('svg')).toBeInTheDocument()
    await user.click(button)
    expect(handleOpen).toHaveBeenCalledTimes(1)
    expect(handleOpen).toHaveBeenCalledWith(project)
  })

  it('montre la capture avec son texte alternatif, chargée en différé', () => {
    renderCard()
    const cover = screen.getByRole('img', { name: "Page d'accueil de Kasa" })
    expect(cover).toHaveAttribute('src', '/images/kasa-cover.webp')
    expect(cover).toHaveAttribute('loading', 'lazy')
  })

  it('place le titre avant la capture dans le code', () => {
    renderCard()
    const title = screen.getByRole('heading', { level: 2 })
    const cover = screen.getByRole('img')
    // DOCUMENT_POSITION_FOLLOWING : la capture vient après le titre
    expect(
      title.compareDocumentPosition(cover) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
