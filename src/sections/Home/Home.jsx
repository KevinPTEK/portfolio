import { GiantMenu } from '../../animations/GiantMenu/GiantMenu.jsx'
import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import avatar128 from '../../assets/images/avatar-128.webp?no-inline'
import avatar256 from '../../assets/images/avatar-256.webp?no-inline'
import avatar512 from '../../assets/images/avatar-512.webp?no-inline'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SocialLinks } from '../../components/SocialLinks/SocialLinks.jsx'
import menu from '../../data/menu.json'
import socials from '../../data/socials.json'
import { pad } from '../../utils/pad.js'
import './Home.scss'

// ?no-inline : sous 4 Ko, Vite glisserait l'image dans le JS (§ 6, Avatar)
const avatarSrcSet = `${avatar128} 128w, ${avatar256} 256w, ${avatar512} 512w`

// une ligne du menu géant par pièce, numérotée dans l'ordre de menu.json
const menuItems = menu.map(({ id, label }, index) => ({
  label,
  href: `#${id}`,
  number: pad(index + 1),
}))

/**
 * L'accueil : qui je suis à gauche (portrait, nom, métier, profils),
 * le menu géant à droite. Sur mobile, l'un sous l'autre.
 */
export function Home() {
  return (
    <Room
      id="home"
      theme="paper-light"
      labelledBy="home-title"
      className="home"
      background={<LivingBackground tone="kraft" />}
    >
      <div className="home__layout">
        <div className="home__content">
          <div className="home__identity">
            {/* alt vide : mon nom est écrit juste à côté */}
            <Avatar src={avatar256} srcSet={avatarSrcSet} alt="" size={104} />
            <h1 className="home__name" id="home-title">
              Kevin Renou.
            </h1>
            <p className="home__job">Développeur front-end.</p>
            <SocialLinks links={socials} className="home__links" />
          </div>
          <nav className="home__menu" aria-label="Menu principal">
            <GiantMenu items={menuItems} />
          </nav>
        </div>
        <div className="home__footer">
          <p className="home__copyright">© 2026</p>
          {/* une indication pour les yeux ; le menu mène déjà aux pièces */}
          <p className="home__scroll" aria-hidden="true">
            Défiler
            <Icon name="arrow" className="home__scroll-icon" />
          </p>
        </div>
      </div>
    </Room>
  )
}
