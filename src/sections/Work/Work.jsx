import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../components/Modal/Modal.jsx'
import { ProjectCard } from '../../components/ProjectCard/ProjectCard.jsx'
import { Room } from '../../components/Room/Room.jsx'
import projects from '../../data/projects.json'
import { OtherWork } from './OtherWork.jsx'
import { ProjectDetails } from './ProjectDetails.jsx'
import './Work.scss'

/**
 * Les travaux : une pièce par projet, aux couleurs du projet, empilées
 * (la suivante glisse par-dessus quand l'écran est assez grand), puis les
 * autres réalisations, et la modale de détail, ouverte par « Voir le projet ».
 * Le conteneur n'est pas une région : chaque projet en est une (§ 8).
 */
export function Work() {
  const [isOpen, setIsOpen] = useState(false)
  // la place du projet affiché dans la modale ; gardée à la fermeture : la modale
  // reste montée (§ 9) et ne change pas de contenu pendant qu'elle se ferme
  const [shownIndex, setShownIndex] = useState(0)
  const detailsTitleRef = useRef(null)
  // « Projet suivant » vient-il d'être demandé ? (le focus suivra, après le rendu)
  const movedToNext = useRef(false)

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

  // le contenu de la modale a changé : le focus va sur le nouveau titre,
  // en haut du détail (APG : un contenu remplacé se signale par le focus)
  useEffect(() => {
    const title = detailsTitleRef.current
    if (movedToNext.current && title) {
      movedToNext.current = false
      // d'abord en haut du détail (sur mobile, la capture est au-dessus du titre),
      // sans animation, puis le focus, sans nouveau défilement
      title
        .closest('.project-details')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' })
      title.focus({ preventScroll: true })
    }
  }, [shownIndex])

  function handleClose() {
    setIsOpen(false)
    // le focus revient au bouton « Voir le projet » du projet affiché : Safari ne
    // le rendrait pas de lui-même, et après « Projet suivant » ce n'est plus
    // celui du départ. C'est le seul bouton de la pièce (ProjectCard).
    document.getElementById(shown.id)?.querySelector('button')?.focus()
  }

  return (
    <div className="work" id="work">
      {projects.map((project, position) => {
        const titleId = `${project.id}-title`
        return (
          <Room
            key={project.id}
            id={project.id}
            theme={project.theme}
            labelledBy={titleId}
            className="work__project"
          >
            <ProjectCard
              project={project}
              titleId={titleId}
              index={position}
              total={projects.length}
              onOpen={() => openProject(position)}
            />
          </Room>
        )
      })}

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
