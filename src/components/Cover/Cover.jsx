import { COVER_ORIGINAL, coverSrcSet } from './coverSrcSet.js'

/**
 * La capture d'un projet : trois largeurs, le navigateur choisit. Il mesure
 * lui-même la place (sizes="auto", possible parce que l'image est chargée en
 * différé : Chrome, Firefox) ; sinon (Safari), il lit la liste donnée par le
 * parent, qui connaît sa mise en page. Place réservée au format 4 : 3 ; le
 * cadre (taille, recadrage, ordre) est celui du parent (mix BEM).
 *
 * @param {object} props
 * @param {{ src: string, alt: string }} props.cover - l'originale, 1 200 px
 * @param {string} props.sizes - la largeur affichée, quand le navigateur ne
 *   la mesure pas : « (min-width: 640px) 50vw, 100vw »
 * @param {string} props.className - la classe du parent qui cadre la capture
 *
 * @example
 * <Cover cover={project.cover} sizes="(min-width: 640px) 50vw, 100vw" className="project-card__cover" />
 */
export function Cover({ cover, sizes, className }) {
  return (
    <img
      className={className}
      src={cover.src}
      srcSet={coverSrcSet(cover.src)}
      sizes={`auto, ${sizes}`}
      alt={cover.alt}
      width={COVER_ORIGINAL.width}
      height={COVER_ORIGINAL.height}
      loading="lazy"
    />
  )
}
