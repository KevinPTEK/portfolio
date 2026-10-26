import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../components/Modal/Modal.jsx'
import projects from '../../data/projects.json'
import { OtherWork } from './OtherWork.jsx'
import { ProjectDetails } from './ProjectDetails.jsx'
import { ProjectRoom } from './ProjectRoom.jsx'
import { useProjectStack } from './useProjectStack.js'
import './Work.scss'

/**
 * Les travaux : une pièce par projet, empilées (la suivante glisse par-dessus
 * quand l'écran est assez grand), les autres réalisations, et la modale de
 * détail.
 */
export function Work() {
  const [isOpen, setIsOpen] = useState(false)
  // le projet de la modale ; gardé à la fermeture (la modale reste montée)
  const [shownIndex, setShownIndex] = useState(0)
  const detailsTitleRef = useRef(null)
  // « Projet suivant » vient d'être demandé : le focus suivra après le rendu
  const movedToNext = useRef(false)
  // le passage entre projets : le recouvert recule, l'arrivant monte
  const stack = useProjectStack()

  const shown = projects[shownIndex]
  const next = projects[(shownIndex + 1) % projects.length]
  const detailsTitleId = `${shown.id}-details-title`

  function openProject(position) {
    setShownIndex(position)
    setIsOpen(true)
  }

  function showNext() {
    movedToNext.current = true
    setShownIndex((current) => (current + 1) % projects.length)
  }

  // le contenu de la modale a changé : le focus va sur le nouveau titre
  useEffect(() => {
    const title = detailsTitleRef.current
    if (movedToNext.current && title) {
      movedToNext.current = false
      // en haut du détail (sur mobile, la capture est au-dessus du titre)
      title
        .closest('.project-details')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' })
      title.focus({ preventScroll: true })
    }
  }, [shownIndex])

  function handleClose() {
    setIsOpen(false)
    // le focus revient au bouton « Voir le projet » du projet affiché (Safari
    // ne le rend pas de lui-même) ; c'est le seul bouton de la pièce
    document.getElementById(shown.id)?.querySelector('button')?.focus()
  }

  return (
    <div className="work" id="work">
      {projects.map((project, position) => (
        <ProjectRoom
          key={project.id}
          project={project}
          position={position}
          total={projects.length}
          onOpen={() => openProject(position)}
          stack={stack}
        />
      ))}

      <OtherWork />

      <Modal
        open={isOpen}
        onClose={handleClose}
        labelledBy={detailsTitleId}
        theme={shown.theme}
      >
        <ProjectDetails
          project={shown}
          index={shownIndex}
          total={projects.length}
          titleId={detailsTitleId}
          titleRef={detailsTitleRef}
          nextName={next.name}
          onNext={showNext}
        />
      </Modal>
    </div>
  )
}
