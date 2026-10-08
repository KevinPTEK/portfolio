import { Button } from '../Button/Button.jsx'
import { TagList } from '../TagList/TagList.jsx'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden.jsx'
import './SiteCard.scss'

/**
 * Carte d'un site vitrine (pièce « Autres réalisations ») : sa capture, son nom,
 * son résumé, ses technologies, le lien vers le site et, s'il est public, vers
 * le code. Plus petite qu'un projet : ni détail, ni modale.
 * Son titre est un <h3> : la carte se pose sous le <h2> d'une pièce.
 * Ne rend pas de <li> : la section écrit la liste.
 *
 * @param {object} props
 * @param {{
 *   name: string,
 *   summary: string,
 *   tags: string[],
 *   links: { site: string, code?: string },
 *   cover: { src: string, alt: string },
 * }} props.site - un site de sites.json (§ 5.1 bis) : les champs lus ici
 *
 * @example
 * <SiteCard site={tournetmarou} />
 */
export function SiteCard({ site }) {
  const { name, summary, tags, links, cover } = site

  return (
    <div className="site-card">
      <div className="site-card__body">
        <h3 className="site-card__name">{name}</h3>
        <p className="site-card__summary">{summary}</p>
        <TagList tags={tags} />
        <div className="site-card__links">
          <Button href={links.site} variant="primary" external>
            Voir le site<VisuallyHidden> {name}</VisuallyHidden>
          </Button>
          {links.code && (
            <Button href={links.code} variant="ghost" external>
              Voir le code<VisuallyHidden> {name}</VisuallyHidden>
            </Button>
          )}
        </div>
      </div>
      {/* après le texte dans le code (le titre ouvre la carte), en premier à l'écran */}
      <img
        className="site-card__cover"
        src={cover.src}
        alt={cover.alt}
        loading="lazy"
      />
    </div>
  )
}
