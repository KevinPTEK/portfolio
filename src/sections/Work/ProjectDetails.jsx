import { Button } from '../../components/Button/Button.jsx'
import { Cover } from '../../components/Cover/Cover.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { TagList } from '../../components/TagList/TagList.jsx'
import { VisuallyHidden } from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import { pad } from '../../utils/pad.js'
import './ProjectDetails.scss'

// la largeur de la capture dans la modale, seule lue par le navigateur (sans
// auto, plus bas) ; à remesurer si la mise en page change
const COVER_SIZES = '(min-width: 1024px) 481px, calc(100vw - 34px)'

/**
 * Le détail d'un projet, dans la modale : capture, titre, contexte,
 * problèmes, apprentissages, technologies, liens et « Projet suivant ».
 *
 * @param {object} props
 * @param {object} props.project - un projet de projects.json
 * @param {number} props.index - sa place, à partir de 0
 * @param {number} props.total - nombre de projets
 * @param {string} props.titleId - id du titre, à donner à labelledBy de la modale
 * @param {import('react').RefObject<HTMLHeadingElement>} [props.titleRef] - pour placer le focus sur le titre
 * @param {string} props.nextName - nom du projet suivant, lu avec « Projet suivant »
 * @param {() => void} props.onNext - affiche le projet suivant
 */
export function ProjectDetails({
  project,
  index,
  total,
  titleId,
  titleRef,
  nextName,
  onNext,
}) {
  const {
    name,
    title,
    accentWord,
    context,
    challenges,
    learned,
    tags,
    links,
    cover,
  } = project

  return (
    // un article : son <header> en est l'en-tête, pas la bannière du site
    <article className="project-details">
      <div className="project-details__body">
        <SectionHeader
          titleId={titleId}
          titleRef={titleRef}
          label={`${pad(index + 1)} / ${pad(total)}`}
          title={title}
          accent={accentWord}
          compact
        />

        <div className="project-details__part">
          <h3 className="project-details__heading">Contexte</h3>
          <p>{context}</p>
        </div>

        <div className="project-details__part">
          <h3 className="project-details__heading">Problèmes rencontrés</h3>
          <ul className="project-details__list">
            {challenges.map((challenge) => (
              <li key={challenge}>{challenge}</li>
            ))}
          </ul>
        </div>

        <div className="project-details__part">
          <h3 className="project-details__heading">Ce que j'ai appris</h3>
          <ul className="project-details__list">
            {learned.map((lesson) => (
              <li key={lesson}>{lesson}</li>
            ))}
          </ul>
        </div>

        <div className="project-details__part">
          <h3 className="project-details__heading">Technologies</h3>
          <TagList tags={tags} />
        </div>

        <div className="project-details__links">
          {/* le site d'abord quand il existe, sinon le code */}
          {links.site && (
            <Button href={links.site} variant="primary" external>
              Voir le site<VisuallyHidden> {name}</VisuallyHidden>
            </Button>
          )}
          <Button
            href={links.code}
            variant={links.site ? 'ghost' : 'primary'}
            external
          >
            Voir le code<VisuallyHidden> {name}</VisuallyHidden>
          </Button>
          <Button onClick={onNext} arrow>
            Projet suivant<VisuallyHidden> : {nextName}</VisuallyHidden>
          </Button>
        </div>
      </div>

      {/* après le texte dans le code, en premier à l'écran ; sans auto : fermée,
          la modale cache la capture, que Chrome remesurerait à 100vw */}
      <Cover
        cover={cover}
        sizes={COVER_SIZES}
        autoSizes={false}
        className="project-details__cover"
      />
    </article>
  )
}
