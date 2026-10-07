import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHeader } from './SectionHeader.jsx'

// Exemple d'usage : l'en-tête de la pièce « Compétences »
function renderHeader(props) {
  return render(
    <SectionHeader
      titleId="skills-title"
      label="03 — Compétences"
      title="Compétences, honnêtement."
      accent="honnêtement."
      {...props}
    />,
  )
}

describe('SectionHeader', () => {
  it('réunit le titre et le mot en accent dans un titre de niveau 2', () => {
    renderHeader()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Compétences, honnêtement.',
      }),
    ).toBeInTheDocument()
  })

  // 724events : la fin du nom est en accent, collée, sans espace
  it('colle le mot en accent quand le titre le colle', () => {
    renderHeader({ title: '724events.', accent: 'events.' })
    // happy-dom ajoute une espace avant le <span> dans le nom accessible :
    // on vérifie donc le texte exact du titre (Chrome lit bien « 724events. »)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toBe('724events.')
    expect(screen.getByText('events.')).toBeInTheDocument()
  })

  it("si l'accent n'est pas la fin du titre, affiche le titre entier", () => {
    renderHeader({ accent: 'ailleurs.' })
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Compétences, honnêtement.',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('ailleurs.')).not.toBeInTheDocument()
  })

  it("donne au titre l'id qui nomme la pièce", () => {
    renderHeader()
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'skills-title',
    )
  })

  it("affiche l'étiquette", () => {
    renderHeader()
    expect(screen.getByText('03 — Compétences')).toBeInTheDocument()
  })

  it("affiche l'introduction quand elle est fournie", () => {
    renderHeader({ lead: 'Je réponds vite.' })
    expect(screen.getByText('Je réponds vite.')).toBeInTheDocument()
  })

  it("sans introduction, n'ajoute pas de paragraphe vide", () => {
    renderHeader()
    // un seul paragraphe : l'étiquette
    expect(screen.getAllByRole('paragraph')).toHaveLength(1)
  })

  it('en compact, prend la variante plus petite', () => {
    const { container } = renderHeader({ compact: true })
    expect(container.querySelector('header')).toHaveClass(
      'section-header',
      'section-header--compact',
    )
  })

  it("sans compact, n'a que sa classe", () => {
    const { container } = renderHeader()
    expect(container.querySelector('header')).toHaveAttribute(
      'class',
      'section-header',
    )
  })

  it('avec titleRef, le titre peut recevoir le focus par le code', () => {
    // la modale y place le focus quand son contenu change (« Projet suivant »)
    const titleRef = { current: null }
    renderHeader({ titleRef })
    const heading = screen.getByRole('heading', { level: 2 })
    expect(titleRef.current).toBe(heading)
    expect(heading).toHaveAttribute('tabindex', '-1')
  })

  it("sans titleRef, le titre n'entre pas dans le parcours du focus", () => {
    renderHeader()
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveAttribute(
      'tabindex',
    )
  })
})
