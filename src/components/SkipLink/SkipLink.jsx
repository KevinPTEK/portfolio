import './SkipLink.scss'

/**
 * Lien d'évitement (WCAG 2.4.1) : premier élément focalisable, il mène droit
 * au contenu. Visible au focus clavier seulement. À placer tout en haut.
 *
 * @param {object} props
 * @param {string} props.href - la cible : « #main »
 * @param {import('react').ReactNode} props.children - où l'on va (« Aller au contenu »)
 */
export function SkipLink({ href, children }) {
  return (
    <a className="skip-link" href={href}>
      {children}
    </a>
  )
}
