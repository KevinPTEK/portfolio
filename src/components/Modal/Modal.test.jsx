import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal.jsx'

// Exemple d'usage : la modale d'un projet, nommée par son titre
function ProjectModal(props) {
  return (
    <Modal
      open
      onClose={() => {}}
      labelledBy="modal-title"
      theme="kasa"
      {...props}
    >
      <h2 id="modal-title">Kasa — location.</h2>
      <p>Application de location immobilière.</p>
    </Modal>
  )
}

describe('Modal', () => {
  it("fermée, n'apparaît pas", () => {
    render(<ProjectModal open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ouverte, est une fenêtre nommée par son titre, aux couleurs du thème', () => {
    render(<ProjectModal />)
    const dialog = screen.getByRole('dialog', { name: 'Kasa — location.' })
    expect(dialog).toHaveAttribute('data-theme', 'kasa')
  })

  it('le bouton Fermer la ferme et prévient le parent', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(<ProjectModal onClose={handleClose} />)
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('un clic sur le fond la ferme', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(<ProjectModal onClose={handleClose} />)
    // le fond (::backdrop) appartient au <dialog> : c'est lui qui reçoit le clic
    await user.click(screen.getByRole('dialog'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('un clic dans le contenu ne la ferme pas', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(<ProjectModal onClose={handleClose} />)
    await user.click(screen.getByText('Application de location immobilière.'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('une sélection commencée dans le contenu et finie sur le fond ne la ferme pas', () => {
    const handleClose = vi.fn()
    render(<ProjectModal onClose={handleClose} />)
    // le navigateur envoie alors le clic au <dialog>, ancêtre commun des deux
    fireEvent.pointerDown(
      screen.getByText('Application de location immobilière.'),
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('le parent peut la fermer puis la rouvrir', () => {
    const { rerender } = render(<ProjectModal />)
    rerender(<ProjectModal open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<ProjectModal open />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})