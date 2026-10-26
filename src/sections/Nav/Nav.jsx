import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { SocialLinks } from '../../components/SocialLinks/SocialLinks.jsx'
import { menuItems } from '../../data/menuItems.js'
import profile from '../../data/profile.json'
import socials from '../../data/socials.json'
import './Nav.scss'

/**
 * La nav fixe, cachée sur l'accueil. Colonne à gauche en bureau, barre en haut
 * en tablette ; sur mobile, la barre ne garde que mon nom et « Menu ». Aux
 * couleurs de la pièce courante.
 *
 * @param {object} props
 * @param {string | null} [props.currentSection] - id de la section affichée
 *   (« work »…) : son lien est marqué aria-current="location"
 * @param {boolean} [props.isArriving=false] - la page vient d'arriver : pas
 *   de fondu des couleurs
 * @param {boolean} [props.isHidden=false] - masquée (accueil), hors de la
 *   tabulation
 */
export function Nav({
  currentSection = null,
  isArriving = false,
  isHidden = false,
}) {
  const className = [
    'nav',
    isHidden && 'nav--hidden',
    isArriving && 'nav--arriving',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={className}>
      <div className="nav__identity">
        <a className="nav__brand" href="#home">
          {/* l'arrivée de l'avatar volant */}
          <span className="nav__avatar" data-avatar-slot="nav">
            <Avatar src={avatar.src} srcSet={avatar.srcSet} alt="" size={56} />
          </span>
          <span>
            {profile.name}
            <span className="nav__dot">.</span>
          </span>
        </a>
        <div className="nav__details">
          <p className="nav__job">{profile.job}</p>
          <SocialLinks links={socials} />
        </div>
      </div>

      <nav className="nav__sections" aria-label="Sections">
        {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une liste */}
        <ol className="nav__list" role="list">
          {menuItems.map(({ id, label, href, number }) => (
            <li key={id}>
              <a
                className="nav__link"
                href={href}
                aria-current={id === currentSection ? 'location' : undefined}
              >
                {/* le numéro devant : le nom suit l'ordre visible (WCAG 2.5.3) */}
                <span className="nav__number">{number}</span> {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <a className="nav__menu-link" href="#menu">
        Menu
      </a>
      <p className="nav__copyright">{profile.copyright}</p>
    </header>
  )
}
