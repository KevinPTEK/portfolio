import './SkipLink.scss'

/**
 * Lien d'évitement : premier élément focalisable de la page, il mène droit
 * au contenu sans traverser la nav (WCAG 2.4.1). Invisible jusqu'au focus
 * clavier, puis bien visible (WebAIM). À placer tout en haut, hors de tout
 * repère (GOV.UK).
 *
 * @param {object} props
 * @param {string} props.href - la cible : « #main »
 * @param {import('react').ReactNode} props.children - le texte : où l'on va
 *   (« Aller au contenu »), pas ce que l'on saute
 *
 * @example
 * <SkipLink href="#main">Aller au contenu</SkipLink>
 */
export function SkipLink({ href, children }) {
  return (
    <a className="skip-link" href={href}>
      {children}
    </a>
  )
}
