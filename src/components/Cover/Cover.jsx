import { COVER_ORIGINAL, coverSrcSet } from './coverSrcSet.js'

/**
 * La capture d'un projet en trois largeurs : le navigateur mesure la place
 * (sizes="auto", image différée), sinon il lit la liste du parent. Le cadre
 * est celui du parent (mix BEM).
 *
 * @param {object} props
 * @param {{ src: string, alt: string }} props.cover - l'originale, 1 200 px
 * @param {string} props.sizes - la largeur affichée, quand le navigateur ne
 *   la mesure pas : « (min-width: 640px) 50vw, 100vw »
 * @param {boolean} [props.autoSizes=true] - false pour une image qui se cache
 *   (modale fermée) : Chrome la remesurerait à 100vw
 * @param {string} props.className - la classe du parent qui cadre la capture
 */
export function Cover({ cover, sizes, autoSizes = true, className }) {
  return (
    <img
      className={className}
      src={cover.src}
      srcSet={coverSrcSet(cover.src)}
      sizes={autoSizes ? `auto, ${sizes}` : sizes}
      alt={cover.alt}
      width={COVER_ORIGINAL.width}
      height={COVER_ORIGINAL.height}
      loading="lazy"
    />
  )
}
