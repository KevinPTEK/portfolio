import { Button } from '../Button/Button.jsx'
import { SectionHeader } from '../SectionHeader/SectionHeader.jsx'
import { TagList } from '../TagList/TagList.jsx'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden.jsx'
import './ProjectCard.scss'

// Deux chiffres, comme la maquette : 1 → « 01 »
function pad(number) {
  return String(number).padStart(2, '0')
}

/**
 * Contenu de la pièce d'un projet : sa capture, sa position (« 01 / 03 »),
 * son titre, son résumé, ses technologies et le bouton qui ouvre la modale.
 *
 * @param {object} props
 * @param {{
 *   title: string,
 *   accentWord: string,
 *   summary: string,
 *   tags: string[],
 *   cover: { src: string, alt: string },
 * }} props.project - un projet de projects.json (§ 5.1) : les champs lus ici
 * @param {string} props.titleId - id du titre, à donner à la prop labelledBy de Room
 * @param {number} props.index - place du projet dans la liste, à partir de 0
 * @param {number} props.total - nombre de projets
 * @param {(project: object) => void} props.onOpen - ouvre la modale de ce projet
 *
 * @example
 * <ProjectCard project={kasa} titleId="kasa-title" index={0} total={3} onOpen={openProject} />
 */
export function ProjectCard({ project, titleId, index, total, onOpen }) {
  const { title, accentWord, summary, tags, cover } = project

  return (
    <div className="project-card">
      <div className="project-card__body">
        <SectionHeader
          titleId={titleId}
          label={`${pad(index + 1)} / ${pad(total)}`}
          title={title}
          accent={accentWord}
          lead={summary}
          compact
        />
        <TagList tags={tags} />
        {/* dans un bloc, le bouton reste en ligne : il garde sa largeur */}
        <div>
          <Button variant="primary" onClick={() => onOpen(project)} arrow>
            Voir le projet<VisuallyHidden> {title}</VisuallyHidden>
          </Button>
        </div>
      </div>
      {/* après le texte dans le code (le titre ouvre la pièce), en premier à l'écran */}
      <img
        className="project-card__cover"
        src={cover.src}
        alt={cover.alt}
        loading="lazy"
      />
    </div>
  )
}
