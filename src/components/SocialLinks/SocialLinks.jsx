import { Icon } from '../Icon/Icon.jsx'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden.jsx'
import './SocialLinks.scss'

/**
 * Liens vers mes profils (GitHub, LinkedIn). Chacun s'ouvre dans un nouvel
 * onglet, annoncé à l'œil (icône ↗) et à l'oreille (texte masqué).
 *
 * @param {object} props
 * @param {{ name: string, href: string }[]} props.links - profils, tirés de socials.json ;
 *   chaque adresse doit être unique
 * @param {string} [props.className] - mix BEM : la classe du parent qui place la liste
 */
export function SocialLinks({ links = [], className }) {
  // une liste vide serait annoncée « liste, 0 élément »
  if (links.length === 0) return null

  return (
    // role="list" : sans puces, Safari ne l'annoncerait plus comme une liste
    <ul
      className={className ? `social-links ${className}` : 'social-links'}
      role="list"
    >
      {links.map(({ name, href }) => (
        <li key={href}>
          {/* rel="me" : ce profil, c'est moi */}
          <a
            className="social-links__link"
            href={href}
            target="_blank"
            rel="me noopener"
          >
            {name}
            <VisuallyHidden> (nouvel onglet)</VisuallyHidden>
            <Icon name="external" />
          </a>
        </li>
      ))}
    </ul>
  )
}
