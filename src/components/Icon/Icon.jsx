import './Icon.scss'

// Tracés des icônes, sur une grille de 16 px
const PATHS = {
  arrow: 'M3 8h10M9 4l4 4-4 4', // →
  external: 'M5 11l6-6M6 5h5v5', // ↗
  download: 'M8 3v8M4 7l4 4 4-4M3 13h10', // ↓
}

/**
 * Icône décorative, dessinée d'un trait de la couleur du texte.
 * Toujours cachée aux lecteurs d'écran : le texte voisin porte le sens.
 *
 * @param {object} props
 * @param {'arrow' | 'external' | 'download'} props.name - icône à dessiner
 * @param {string} [props.className] - classe du parent qui place l'icône (mix BEM)
 *
 * @example
 * <Icon name="external" className="button__icon" />
 */
export function Icon({ name, className }) {
  const path = PATHS[name]

  if (!path) return null

  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}
