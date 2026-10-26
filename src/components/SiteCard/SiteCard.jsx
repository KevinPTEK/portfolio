import { Button } from '../Button/Button.jsx'
import { Cover } from '../Cover/Cover.jsx'
import { TagList } from '../TagList/TagList.jsx'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden.jsx'
import './SiteCard.scss'

// la largeur de la capture, pour le navigateur qui ne la mesure pas
// (approchée ; à remesurer si la mise en page change)
const COVER_SIZES = '(min-width: 640px) 360px, calc(100vw - 40px)'

/**
 * Carte d'un site vitrine : capture, nom, résumé, technologies, lien vers le
 * site et, s'il est public, vers le code. Titre en <h3>, sous le <h2> de la
 * pièce ; la section écrit la liste.
 *
 * @param {object} props
 * @param {{
 *   name: string,
 *   summary: string,
 *   tags: string[],
 *   links: { site: string, code?: string },
 *   cover: { src: string, alt: string },
 * }} props.site - un site de sites.json
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
      <Cover cover={cover} sizes={COVER_SIZES} className="site-card__cover" />
    </div>
  )
}
