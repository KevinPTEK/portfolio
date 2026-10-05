import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Icon } from '../Icon/Icon.jsx'
import { Modal } from './Modal.jsx'

// Exemple d'usage : la modale d'un projet, nommée par son titre
function ProjectModal({ titleId = 'modal-title', ...props }) {
  return (
    <Modal open onClose={() => {}} labelledBy={titleId} theme="kasa" {...props}>
      <h2 id={titleId}>Kasa — location.</h2>
      <p>Application de location immobilière.</p>
    </Modal>
  )
}

describe('Modal', () => {
  it("fermée, n'apparaît pas", () => {
    render(<ProjectModal open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // deux jeux de valeurs : une valeur écrite en dur ne peut pas passer les deux
  it.each([
    ['kasa', 'kasa-title'],
    ['argent', 'argent-title'],
  ])(
    'ouverte, est une fenêtre nommée par son titre, au thème %s',
    (theme, titleId) => {
      render(<ProjectModal theme={theme} titleId={titleId} />)
      const dialog = screen.getByRole('dialog', { name: 'Kasa — location.' })
      expect(dialog).toHaveAttribute('data-theme', theme)
    },
  )

  // happy-dom ne fait pas la différence entre show() et showModal() :
  // on vérifie donc l'appel lui-même (showModal rend le reste de la page inerte)
  it("s'ouvre en modale", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    render(<ProjectModal />)
    expect(showModal).toHaveBeenCalledTimes(1)
    showModal.mockRestore()
  })

  it("à l'ouverture, place le focus sur le bouton Fermer, avant le contenu", () => {
    render(<ProjectModal />)
    const button = screen.getByRole('button', { name: 'Fermer' })
    expect(button).toHaveFocus()
    const content = screen.getByText('Application de location immobilière.')
    expect(
      button.compareDocumentPosition(content) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('le bouton Fermer montre la croix', () => {
    const { container } = render(<Icon name="close" />)
    const cross = container.querySelector('path').getAttribute('d')
    render(<ProjectModal />)
    const button = screen.getByRole('button', { name: 'Fermer' })
    expect(button.querySelector('path')).toHaveAttribute('d', cross)
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

  it("un clic ne compte que s'il a commencé sur le fond", () => {
    const handleClose = vi.fn()
    render(<ProjectModal onClose={handleClose} />)
    const dialog = screen.getByRole('dialog')
    // appui sur le fond, mais clic reçu par le contenu : rien
    fireEvent.pointerDown(dialog)
    fireEvent.click(screen.getByText('Application de location immobilière.'))
    // puis un clic sur le fond sans nouvel appui : rien non plus
    fireEvent.click(dialog)
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
