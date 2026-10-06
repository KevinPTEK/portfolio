import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Room } from './Room.jsx'

// Exemple d'usage : une pièce « À propos », nommée par son titre
function renderRoom(props) {
  render(
    <Room id="about" theme="paper-cool" labelledBy="about-title" {...props}>
      <h2 id="about-title">À propos</h2>
    </Room>,
  )
  // une <section> n'est une région que si elle a un nom accessible
  return screen.getByRole('region', { name: 'À propos' })
}

describe('Room', () => {
  it('est une région nommée par son titre', () => {
    const room = renderRoom()
    expect(room).toBeInTheDocument()
  })

  it("porte l'identifiant de la pièce", () => {
    const room = renderRoom()
    expect(room).toHaveAttribute('id', 'about')
  })

  it('porte le thème de ses couleurs', () => {
    const room = renderRoom()
    expect(room).toHaveAttribute('data-theme', 'paper-cool')
  })

  it('affiche son contenu', () => {
    const room = renderRoom()
    expect(
      within(room).getByRole('heading', { name: 'À propos' }),
    ).toBeInTheDocument()
  })

  it("affiche le fond qu'on lui donne", () => {
    const room = renderRoom({
      background: <div aria-hidden="true" data-testid="background" />,
    })
    expect(within(room).getByTestId('background')).toBeInTheDocument()
  })

  it('ajoute la classe de la section qui la règle (mix BEM)', () => {
    const room = renderRoom({ className: 'home' })
    expect(room).toHaveAttribute('class', 'room home')
  })

  it("sans className, n'a que sa classe", () => {
    const room = renderRoom()
    expect(room).toHaveAttribute('class', 'room')
  })
})
