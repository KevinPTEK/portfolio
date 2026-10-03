import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHeader } from './SectionHeader.jsx'

// Exemple d'usage : l'en-tête de la pièce « Compétences »
function renderHeader(props) {
  return render(
    <SectionHeader
      titleId="skills-title"
      label="03 — Compétences"
      title="Compétences,"
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
})
