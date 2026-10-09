import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { sectionLabel } from '../../data/menuItems.js'
import socials from '../../data/socials.json'
import { CvButton } from '../shared/CvButton.jsx'
import './About.scss'

// présent : socials.test.js le vérifie
const linkedin = socials.find(({ name }) => name === 'LinkedIn')

/**
 * « À propos » : qui je suis, en trois paragraphes, mon portrait posé sur son
 * reflet flouté, mon CV (quand le PDF existe) et LinkedIn. Papier froid.
 */
export function About() {
  return (
    <Room
      id="about"
      theme="paper-cool"
      labelledBy="about-title"
      className="about"
      background={<LivingBackground tone="cool" />}
    >
      <div className="about__layout">
        <div className="about__text">
          <SectionHeader
            titleId="about-title"
            label={sectionLabel('about')}
            title="Bonjour, moi c'est Kevin."
            accent="Kevin."
          />
          {/* Brouillon de la maquette, à vérifier par Kevin (9 oct.) :
              l'intitulé de la formation, « Douze projets », les loisirs */}
          <p className="about__paragraph">
            <span className="about__highlight">
              Développeur front-end en fin de formation «&nbsp;Intégrateur
              web&nbsp;» chez OpenClassrooms.
            </span>{' '}
            Douze projets plus tard, je sais construire une interface de la
            maquette au déploiement.
          </p>
          <p className="about__paragraph">
            Ce qui me plaît&nbsp;: le soin du détail — un espacement juste, une
            animation qui tombe bien, un site qui reste lisible pour tout le
            monde.
          </p>
          <p className="about__paragraph">
            En dehors du code&nbsp;: le pixel art, les mangas, et les interfaces
            bien dessinées.
          </p>
          <div className="about__actions">
            <CvButton variant="primary" />
            <Button href={linkedin.href} external>
              LinkedIn
            </Button>
          </div>
        </div>

        {/* après le texte dans le code (le titre ouvre la pièce), devant à
            l'écran ; décoratif : mon prénom est le titre */}
        <div className="about__portrait">
          <img className="about__reflection" src={avatar.blur} alt="" />
          <span className="about__avatar">
            <Avatar
              src={avatar.src}
              srcSet={avatar.srcSet}
              alt=""
              size={256}
              loading="lazy"
            />
          </span>
        </div>
      </div>
    </Room>
  )
}
