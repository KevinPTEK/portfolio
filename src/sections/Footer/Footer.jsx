import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import profile from '../../data/profile.json'
import './Footer.scss'

/**
 * Le pied de page, après <main> : hors de toute section, <footer> devient le
 * repère « contentinfo » (APG — dans une <section>, il ne l'est plus). Au
 * kraft de « Contact », en bande sous elle.
 */
export function Footer() {
  return (
    <footer className="footer" data-theme="paper-light">
      <LivingBackground tone="kraft" />
      {/* plafonné comme le contenu des pièces (Room) : aligné sur lui */}
      <div className="footer__inner">
        <p className="footer__signature">
          {profile.copyright} {profile.name}
        </p>
        {/* #main : le contenu, focalisable (tabIndex -1) — le focus suit le
            lien au lieu de retomber sur <body> quand la nav se cache */}
        <a className="footer__top" href="#main">
          Haut de page
          <Icon name="arrow" className="footer__top-icon" />
        </a>
      </div>
    </footer>
  )
}
