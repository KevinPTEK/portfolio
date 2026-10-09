import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { sectionLabel } from '../../data/menuItems.js'
import profile from '../../data/profile.json'
import socials from '../../data/socials.json'
import { CvButton } from '../shared/CvButton.jsx'
import './Contact.scss'

/**
 * « Contact » : mon adresse e-mail en grand, écrite en toutes lettres (sans
 * logiciel de messagerie, on peut la copier), mes profils et mon CV. Kraft,
 * comme l'accueil : la visite se referme sur le papier du départ.
 */
export function Contact() {
  return (
    <Room
      id="contact"
      theme="paper-light"
      labelledBy="contact-title"
      className="contact"
      background={<LivingBackground tone="kraft" />}
    >
      <SectionHeader
        titleId="contact-title"
        label={sectionLabel('contact')}
        title="Travaillons ensemble."
        accent="ensemble."
        lead={
          'Un poste, une alternance, un projet, une simple question\u00a0: je réponds vite.'
        }
      />
      {/* Brouillon de la maquette : l'adresse est à vérifier par Kevin (9 oct.) */}
      <a className="contact__email" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <div className="contact__actions">
        {socials.map(({ name, href }) => (
          <Button key={href} href={href} external>
            {name}
          </Button>
        ))}
        <CvButton />
      </div>
    </Room>
  )
}
