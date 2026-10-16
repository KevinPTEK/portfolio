import * as m from 'motion/react-m'
import { unblur } from '../variants.js'
import './GiantMenu.scss'

/**
 * Menu typographique géant : une pièce par ligne, en grandes capitales, avec
 * son numéro. Au survol et au focus, le mot prend la couleur d'accent (et
 * grandit, en bureau), les autres s'estompent (en CSS, § 7.5).
 * Le parent décide du repère : <nav aria-label="Menu principal"> sur l'accueil.
 *
 * @param {object} props
 * @param {{ label: string, href: string, number: string }[]} props.items - les pièces,
 *   dans leur ordre ; chaque href doit être unique
 *
 * @example
 * <GiantMenu items={[{ label: 'À propos', href: '#about', number: '01' }]} />
 */
export function GiantMenu({ items = [] }) {
  // une liste vide serait annoncée « liste, 0 élément » : on n'affiche rien
  if (items.length === 0) return null

  return (
    // role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10)
    <ol className="giant-menu" role="list">
      {items.map(({ label, href, number }) => (
        // chaque ligne entre avec l'accueil (variant unblur, § 7.4) ; seul, le
        // menu ne bouge pas
        <m.li key={href} className="giant-menu__item" variants={unblur}>
          <a className="giant-menu__link" href={href}>
            {label}
            {/* l'espace donne le nom « À propos 01 » ; à l'écran, le numéro hors du flux l'efface */}
            <span className="giant-menu__number"> {number}</span>
          </a>
        </m.li>
      ))}
    </ol>
  )
}
