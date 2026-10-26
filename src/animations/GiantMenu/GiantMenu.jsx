import * as m from 'motion/react-m'
import { unblur } from '../variants.js'
import './GiantMenu.scss'

/**
 * Menu typographique géant : une pièce par ligne, avec son numéro. Au survol
 * et au focus, le mot est mis en avant, les autres s'estompent (CSS). Le
 * parent décide du repère (<nav> sur l'accueil).
 *
 * @param {object} props
 * @param {{ label: string, href: string, number: string }[]} props.items - les
 *   pièces, dans leur ordre ; chaque href est unique
 */
export function GiantMenu({ items = [] }) {
  // une liste vide serait annoncée « liste, 0 élément »
  if (items.length === 0) return null

  return (
    // role="list" : sans puces, Safari ne l'annoncerait plus comme une liste
    <ol className="giant-menu" role="list">
      {items.map(({ label, href, number }) => (
        // chaque ligne entre avec l'accueil (unblur)
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
