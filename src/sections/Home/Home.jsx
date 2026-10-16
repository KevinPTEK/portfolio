import * as m from 'motion/react-m'
import { GiantMenu } from '../../animations/GiantMenu/GiantMenu.jsx'
import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { ENTRANCE, unblur } from '../../animations/variants.js'
import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SocialLinks } from '../../components/SocialLinks/SocialLinks.jsx'
import { REDUCED_MOTION, useMediaQuery } from '../../hooks/useMediaQuery.js'
import { menuItems } from '../../data/menuItems.js'
import profile from '../../data/profile.json'
import socials from '../../data/socials.json'
import './Home.scss'

/**
 * L'accueil : qui je suis à gauche (portrait, nom, métier, profils),
 * le menu géant à droite. Sur mobile, l'un sous l'autre. Il entre en scène
 * (flou → net, le bloc identité puis les lignes du menu) quand l'intro rend
 * la main, ou d'emblée sous « réduire les animations » (§ 7.4).
 *
 * @param {object} props
 * @param {boolean} [props.entered=true] - l'intro a rendu la main (ready) :
 *   l'accueil entre
 *
 * @example
 * <Home entered={intro.phase === 'ready' || intro.phase === 'done'} />
 */
export function Home({ entered = true }) {
  const reduced = useMediaQuery(REDUCED_MOTION)

  return (
    <Room
      id="home"
      theme="paper-light"
      labelledBy="home-title"
      className="home"
      background={<LivingBackground tone="kraft" />}
    >
      <div className="home__layout">
        <m.div
          className="home__content"
          // sous « réduire les animations » : en place d'emblée, sans attendre l'intro
          initial={reduced ? false : 'hidden'}
          animate={entered || reduced ? 'visible' : 'hidden'}
          variants={ENTRANCE}
        >
          <m.div className="home__identity" variants={unblur}>
            {/* le départ de l'avatar volant (§ 7.9) — élément de la grille :
                un bloc, sans règle de plus */}
            <span data-avatar-slot="home">
              {/* alt vide : mon nom est écrit juste à côté */}
              <Avatar
                src={avatar.src}
                srcSet={avatar.srcSet}
                alt=""
                size={104}
              />
            </span>
            <h1 className="home__name" id="home-title">
              {profile.name}.
            </h1>
            <p className="home__job">{profile.job}</p>
            <SocialLinks links={socials} className="home__links" />
          </m.div>
          {/* id : la cible du lien « Menu » de la barre mobile (Nav) */}
          <nav className="home__menu" id="menu" aria-label="Menu principal">
            <GiantMenu items={menuItems} />
          </nav>
        </m.div>
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
