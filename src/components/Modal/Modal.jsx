import { useEffect, useRef } from 'react'
import { Icon } from '../Icon/Icon.jsx'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden.jsx'
import './Modal.scss'

/**
 * Fenêtre modale native (<dialog>), aux couleurs d'un thème. Elle se ferme
 * par Échap, par le bouton ✕ ou par un clic sur le fond : dans tous les cas,
 * le navigateur émet l'évènement close, qui prévient le parent.
 *
 * @param {object} props
 * @param {boolean} props.open - ouverte ou fermée : c'est le parent qui décide
 * @param {() => void} props.onClose - appelée quand la modale s'est fermée, quelle qu'en soit
 *   la raison ; le parent doit y remettre open à false
 * @param {string} props.labelledBy - id du titre (dans children) qui nomme la modale
 * @param {string} [props.theme] - un thème de _themes.scss (« argent »…)
 * @param {import('react').ReactNode} props.children - le contenu
 *
 * @example
 * <Modal open={Boolean(project)} onClose={closeProject} labelledBy="modal-title" theme="argent">
 *   <h2 id="modal-title">Argent Bank.</h2>
 * </Modal>
 */
export function Modal({ open, onClose, labelledBy, theme, children }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  // le geste a-t-il commencé sur le fond ? (une sélection de texte peut finir dessus)
  const pressedOnBackdrop = useRef(false)

  // Le parent dit « ouverte » ou « fermée », le <dialog> exécute
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      dialog.showModal()
      // le focus va au ✕, pas à la zone qui défile (que Chrome rend focalisable)
      closeRef.current.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function closeDialog() {
    dialogRef.current.close()
  }

  // Sur le fond, la cible est le <dialog> lui-même : son contenu le remplit entièrement
  function handlePointerDown(event) {
    pressedOnBackdrop.current = event.target === event.currentTarget
  }

  function handleClick(event) {
    const startedOnBackdrop = pressedOnBackdrop.current
    pressedOnBackdrop.current = false // un geste = un clic
    if (startedOnBackdrop && event.target === event.currentTarget) {
      closeDialog()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      data-theme={theme}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div className="modal__content">
        {/* premier dans le code : il reçoit le focus à l'ouverture ; placé dans
            la zone qui défile, les flèches du clavier la font défiler */}
        <button
          ref={closeRef}
          className="modal__close"
          type="button"
          onClick={closeDialog}
        >
          <Icon name="close" />
          <VisuallyHidden>Fermer</VisuallyHidden>
        </button>
        {children}
      </div>
    </dialog>
  )
}
