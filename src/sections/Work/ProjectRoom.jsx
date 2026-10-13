import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Reveal } from '../../animations/Reveal/Reveal.jsx'
import { ProjectCard } from '../../components/ProjectCard/ProjectCard.jsx'
import { Room } from '../../components/Room/Room.jsx'

/**
 * Une pièce-projet de « Travaux », précédée de son repère. Le repère dit où
 * la pièce commence dans le flux (collée, elle ne le dit plus) : de sa
 * position, useProjectStack tire l'arrivée de la pièce par-dessus la
 * précédente (§ 7.10).
 *
 * @param {object} props
 * @param {object} props.project - une entrée de projects.json
 * @param {number} props.position - sa place (0 pour le premier)
 * @param {number} props.total - le nombre de projets
 * @param {() => void} props.onOpen - « Voir le projet »
 * @param {ReturnType<typeof import('./useProjectStack.js').useProjectStack>} props.stack
 *   - reçoit son repère et sa section (setMarker, setRoom), à sa place
 *
 * @example
 * <ProjectRoom project={projects[1]} position={1} total={3} onOpen={…} stack={stack} />
 */
export function ProjectRoom({ project, position, total, onOpen, stack }) {
  const titleId = `${project.id}-title`
  return (
    <>
      <div
        className="work__marker"
        aria-hidden="true"
        ref={(node) => stack.setMarker(position, node)}
      />
      <Room
        ref={(node) => stack.setRoom(position, node)}
        id={project.id}
        theme={project.theme}
        labelledBy={titleId}
        className="work__project"
        background={
          <LivingBackground variant="cover" image={project.cover.blur} />
        }
      >
        <Reveal>
          <ProjectCard
            project={project}
            titleId={titleId}
            index={position}
            total={total}
            onOpen={onOpen}
          />
        </Reveal>
      </Room>
    </>
  )
}
