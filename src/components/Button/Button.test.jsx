import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button.jsx'

// Exemples d'usage : les quatre sortes de boutons du site
describe('Button', () => {
  it('avec href, est un lien vers cette adresse', () => {
    render(<Button href="#contact">Me contacter</Button>)
    const link = screen.getByRole('link', { name: 'Me contacter' })
    expect(link).toHaveAttribute('href', '#contact')
  })

  it('sans href, est un bouton qui ne soumet aucun formulaire', () => {
    render(<Button onClick={() => {}}>Voir le projet</Button>)
    const button = screen.getByRole('button', { name: 'Voir le projet' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('appelle onClick quand on clique', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Voir le projet</Button>)
    await user.click(screen.getByRole('button', { name: 'Voir le projet' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('en externe, ouvre un nouvel onglet et le dit', () => {
    render(
      <Button href="https://github.com/KevinPTEK" external>
        GitHub
      </Button>,
    )
    // le texte masqué fait partie du nom lu par le lecteur d'écran
    const link = screen.getByRole('link', { name: 'GitHub (nouvel onglet)' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
  })

  it('en interne, reste dans le même onglet', () => {
    render(<Button href="#contact">Me contacter</Button>)
    const link = screen.getByRole('link', { name: 'Me contacter' })
    expect(link).not.toHaveAttribute('target')
  })

  it("en téléchargement, porte l'attribut download", () => {
    render(
      <Button href="/resume.pdf" download>
        Télécharger mon CV (PDF)
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Télécharger mon CV (PDF)' })
    expect(link).toHaveAttribute('download')
  })

  it("sans href, n'annonce pas de nouvel onglet", () => {
    render(<Button external>GitHub</Button>)
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument()
  })
})
