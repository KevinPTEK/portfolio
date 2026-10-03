import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisuallyHidden } from './VisuallyHidden.jsx'

// Exemple d'usage : préciser un bouton répété (« Voir le projet Kasa »)
describe('VisuallyHidden', () => {
  it("ajoute son texte au nom lu par le lecteur d'écran", () => {
    render(
      <button type="button">
        Voir le projet<VisuallyHidden> Kasa</VisuallyHidden>
      </button>,
    )
    expect(
      screen.getByRole('button', { name: 'Voir le projet Kasa' }),
    ).toBeInTheDocument()
  })
})
