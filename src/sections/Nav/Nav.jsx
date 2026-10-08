import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { SocialLinks } from '../../components/SocialLinks/SocialLinks.jsx'
import { menuItems } from '../../data/menuItems.js'
import socials from '../../data/socials.json'
import './Nav.scss'

/**
 * La nav fixe, cachée sur l'accueil (le menu géant y fait office de nav).
 * Bureau : une colonne à gauche — mon nom, mon métier, mes profils, les
 * pièces, « © 2026 ». Tablette : une barre en haut avec les pièces. Mobile :
 * la barre ne garde que mon nom et « Menu », qui ramène au menu géant (charte).
 * Ses couleurs sont celles du <body>, donc de la pièce courante (§ 7.7).
 *
 * @param {object} props
 * @param {string | null} [props.currentSection] - id de la section affichée
 *   (« work »…) : son lien est marqué aria-current="location"
 * @param {boolean} [props.isHidden=false] - masquée (accueil) : invisible et
 *   hors de la tabulation (une classe, pas l'attribut HTML hidden)
 */
export function Nav({ currentSection = null, isHidden = false }) {
  return (
    <header className={isHidden ? 'nav nav--hidden' : 'nav'}>
      <div className="nav__identity">
        <a className="nav__brand" href="#home">
          {/* l'emplacement du portrait : 28 px en barre, 56 px en colonne */}
          <span className="nav__avatar">
            {/* alt vide : mon nom est écrit juste à côté */}
            <Avatar src={avatar.src} srcSet={avatar.srcSet} alt="" size={56} />
          </span>
          <span>
            Kevin Renou<span className="nav__dot">.</span>
          </span>
        </a>
        <div className="nav__details">
          <p className="nav__job">Développeur front-end.</p>
          <SocialLinks links={socials} />
        </div>
      </div>

      <nav className="nav__sections" aria-label="Sections">
        {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10) */}
        <ol className="nav__list" role="list">
          {menuItems.map(({ id, label, href, number }) => (
            <li key={id}>
              <a
                className="nav__link"
                href={href}
                aria-current={id === currentSection ? 'location' : undefined}
              >
                {/* devant, dans le code comme à l'écran : le nom « 01 À propos »
                    suit l'ordre visible (WCAG 2.5.3, commande vocale) */}
                <span className="nav__number">{number}</span> {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <a className="nav__menu-link" href="#menu">
        Menu
      </a>
      <p className="nav__copyright">© 2026</p>
    </header>
  )
}
