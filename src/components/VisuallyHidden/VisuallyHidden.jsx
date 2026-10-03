import './VisuallyHidden.scss'

/**
 * Texte lu par les lecteurs d'écran, invisible à l'écran.
 * Pour du texte seulement : un lien ou un bouton caché ainsi resterait
 * invisible même quand il reçoit le focus clavier.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - texte à faire lire
 *
 * @example
 * GitHub<VisuallyHidden> (nouvel onglet)</VisuallyHidden>
 */
export function VisuallyHidden({ children }) {
  return <span className="visually-hidden">{children}</span>
}
