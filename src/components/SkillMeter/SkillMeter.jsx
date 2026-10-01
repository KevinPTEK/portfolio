import './SkillMeter.scss'

/**
 * Une compétence et son niveau en points (●●○).
 * Les points forment une seule image, nommée « niveau 2 sur 3 ».
 *
 * @param {object} props
 * @param {string} props.name - nom de la compétence (« React »)
 * @param {string} [props.detail] - précision sous le nom (« Hooks, Router »)
 * @param {number} props.level - niveau, de 1 à max
 * @param {number} [props.max=3] - nombre de points
 *
 * @example
 * <SkillMeter name="React" detail="Hooks, Router" level={2} />
 */
export function SkillMeter({ name, detail, level, max = 3 }) {
  // [true, true, false] pour un niveau 2 sur 3
  const dots = Array.from({ length: max }, (_, index) => index < level)

  return (
    <div className="skill-meter">
      <div className="skill-meter__text">
        <p className="skill-meter__name">{name}</p>
        {detail && <p className="skill-meter__detail">{detail}</p>}
      </div>
      <span
        className="skill-meter__level"
        role="img"
        aria-label={`niveau ${level} sur ${max}`}
      >
        {dots.map((isFilled, index) => (
          // l'index suffit : les points ne sont jamais triés ni supprimés
          <span
            key={index}
            className={`skill-meter__dot${isFilled ? ' skill-meter__dot--filled' : ''}`}
          />
        ))}
      </span>
    </div>
  )
}
