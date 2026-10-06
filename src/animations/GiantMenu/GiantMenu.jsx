import './GiantMenu.scss'

/**
 * Menu typographique géant : une pièce par ligne, en grandes capitales, avec
 * son numéro. Au survol et au focus, le mot passe en italique couleur d'accent
 * (un calque dessiné par le CSS, à partir de data-label).
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
        <li key={href}>
          <a className="giant-menu__link" href={href}>
            <span className="giant-menu__word" data-label={label}>
              {label}
            </span>
            {/* l'espace donne le nom « À propos 01 » ; à l'écran, le numéro hors du flux l'efface */}
            <span className="giant-menu__number"> {number}</span>
          </a>
        </li>
      ))}
    </ol>
  )
}
