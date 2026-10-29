import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Reveal } from '../../animations/Reveal/Reveal.jsx'
import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { sectionLabel } from '../../data/menuItems.js'
import socials from '../../data/socials.json'
import { CvButton } from '../shared/CvButton.jsx'
import './About.scss'

const linkedin = socials.find(({ name }) => name === 'LinkedIn')

/**
 * « À propos » : cinq paragraphes, mon portrait sur son reflet flouté, mon CV
 * (quand le PDF existe) et LinkedIn.
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
        <Reveal className="about__text">
          <SectionHeader
            titleId="about-title"
            label={sectionLabel('about')}
            title="Bonjour, moi c'est Kevin."
            accent="Kevin."
          />
          <p className="about__paragraph">
            <span className="about__highlight">
              Développeur front-end React à Lyon, en fin de formation
              «&nbsp;Développeur web&nbsp;» chez OpenClassrooms.
            </span>{' '}
            Douze projets plus tard, je sais construire une interface de la
            maquette au déploiement.
          </p>
          <p className="about__paragraph">
            J'ai travaillé sur du code neuf comme sur celui des autres&nbsp;:
            une application bancaire en React et Redux, un site à déboguer, un
            autre à rendre plus rapide, et le site vitrine d'un vrai client.
          </p>
          <p className="about__paragraph">
            Ce qui me plaît&nbsp;: le soin du détail, un espacement juste, une
            animation qui tombe bien, un site rapide et lisible pour tout le
            monde.
          </p>
          <p className="about__paragraph">
            En dehors du code&nbsp;: le pixel art, les mangas, et les interfaces
            bien dessinées.
          </p>
          <p className="about__paragraph">
            Je cherche aujourd'hui un poste de développeur web front-end, ou des
            projets à construire.
          </p>
          <div className="about__actions">
            <CvButton variant="primary" />
            <Button href={linkedin.href} external>
              LinkedIn
            </Button>
          </div>
        </Reveal>

        {/* après le texte dans le code, devant à l'écran ; décoratif */}
        <Reveal className="about__portrait">
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
        </Reveal>
      </div>
    </Room>
  )
}
