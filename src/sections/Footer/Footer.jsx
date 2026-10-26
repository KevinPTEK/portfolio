import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import profile from '../../data/profile.json'
import './Footer.scss'

/**
 * Le pied de page, après <main> : hors de toute section, <footer> est le
 * repère « contentinfo ».
 */
export function Footer() {
  return (
    <footer className="footer" data-theme="paper-light">
      <LivingBackground tone="kraft" />
      <div className="footer__inner">
        <p className="footer__signature">
          {profile.copyright} {profile.name}
        </p>
        {/* #main est focalisable : le focus suit le lien */}
        <a className="footer__top" href="#main">
          Haut de page
          <Icon name="arrow" className="footer__top-icon" />
        </a>
      </div>
    </footer>
  )
}
