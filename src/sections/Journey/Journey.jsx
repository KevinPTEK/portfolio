import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Reveal } from '../../animations/Reveal/Reveal.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import journey from '../../data/journey.json'
import { sectionLabel } from '../../data/menuItems.js'
import './Journey.scss'

// le déclic : cette étape et les suivantes passent à la couleur d'accent
const TURN = journey.findIndex((step) => step.turningPoint)

/**
 * « Parcours » : une frise, de la plus ancienne étape à la plus récente.
 */
export function Journey() {
  return (
    <Room
      id="journey"
      theme="paper-light"
      labelledBy="journey-title"
      className="journey"
      background={<LivingBackground />}
    >
      <Reveal>
        <SectionHeader
          titleId="journey-title"
          label={sectionLabel('journey')}
          title="De la maintenance au code."
          accent="au code."
          lead="Des années à dépanner des machines industrielles, puis l'envie de construire mes propres outils."
        />
      </Reveal>
      {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une
          liste. Une apparition par étape : la frise est plus haute que l'écran */}
      <ol className="journey__steps" role="list">
        {journey.map(({ date, kind, title, text }, index) => (
          <Reveal as="li" key={title} className={stepClass(index)}>
            <span className="journey__dot" aria-hidden="true" />
            <p className="journey__date">{date}</p>
            <div className="journey__card">
              <p className="journey__kind">{kind}</p>
              <h3 className="journey__title">{title}</h3>
              <p className="journey__text">{text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Room>
  )
}

function stepClass(index) {
  if (index === TURN) return 'journey__step journey__step--turn'
  if (TURN !== -1 && index > TURN) return 'journey__step journey__step--after'
  return 'journey__step'
}
