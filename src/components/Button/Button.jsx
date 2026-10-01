import './Button.scss'

// Tracés des icônes, sur une grille de 16 px : → ↗ ↓
const ICON_PATHS = {
  arrow: 'M3 8h10M9 4l4 4-4 4',
  external: 'M5 11l6-6M6 5h5v5',
  download: 'M8 3v8M4 7l4 4 4-4M3 13h10',
}

// L'icône découle de ce que fait le bouton : on ne peut pas l'oublier
function getIcon({ external, download, arrow }) {
  if (external) return 'external'
  if (download) return 'download'
  if (arrow) return 'arrow'
  return null
}

/**
 * Bouton en pilule. Avec `href`, c'est un lien (il mène ailleurs) ;
 * sans `href`, c'est un vrai bouton (il agit sur la page).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - texte visible
 * @param {'primary' | 'ghost'} [props.variant='ghost'] - plein (encre) ou bordé
 * @param {string} [props.href] - adresse : rend un lien <a>
 * @param {() => void} [props.onClick] - action : rend un <button>
 * @param {boolean} [props.external=false] - autre site : nouvel onglet, annoncé (icône ↗ + texte masqué)
 * @param {boolean} [props.download=false] - fichier à télécharger (icône ↓) ; le texte doit dire le format
 * @param {boolean} [props.arrow=false] - flèche → après le texte
 *
 * @example
 * <Button href="https://github.com/KevinPTEK" external>GitHub</Button>
 * <Button variant="primary" onClick={openProject} arrow>Voir le projet</Button>
 */
export function Button({
  children,
  variant = 'ghost',
  href,
  onClick,
  external = false,
  download = false,
  arrow = false,
}) {
  const className = `button button--${variant}`
  const opensNewTab = Boolean(href) && external
  const isDownload = Boolean(href) && download
  const icon = getIcon({ external: opensNewTab, download: isDownload, arrow })

  const content = (
    <>
      {children}
      {opensNewTab && <span className="button__hint"> (nouvel onglet)</span>}
      {icon && (
        <svg className="button__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d={ICON_PATHS[icon]} />
        </svg>
      )}
    </>
  )

  if (href) {
    return (
      <a
        className={className}
        href={href}
        target={opensNewTab ? '_blank' : undefined}
        rel={opensNewTab ? 'noopener' : undefined}
        download={isDownload}
      >
        {content}
      </a>
    )
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {content}
    </button>
  )
}
