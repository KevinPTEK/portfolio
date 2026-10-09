import { GiantMenu } from '../../animations/GiantMenu/GiantMenu.jsx'
import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SocialLinks } from '../../components/SocialLinks/SocialLinks.jsx'
import { menuItems } from '../../data/menuItems.js'
import profile from '../../data/profile.json'
import socials from '../../data/socials.json'
import './Home.scss'

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
            <Avatar src={avatar.src} srcSet={avatar.srcSet} alt="" size={104} />
            <h1 className="home__name" id="home-title">
              {profile.name}.
            </h1>
            <p className="home__job">{profile.job}</p>
            <SocialLinks links={socials} className="home__links" />
          </div>
          {/* id : la cible du lien « Menu » de la barre mobile (Nav) */}
          <nav className="home__menu" id="menu" aria-label="Menu principal">
            <GiantMenu items={menuItems} />
          </nav>
        </div>
        <div className="home__footer">
          <p className="home__copyright">{profile.copyright}</p>
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
