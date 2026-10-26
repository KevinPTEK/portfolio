import './LivingBackground.scss'

/**
 * Le fond d'une pièce : du papier, ou la capture floutée d'un projet voilée
 * de la couleur de la pièce. Décoratif et immobile. À passer à la prop
 * `background` de Room.
 *
 * @param {object} props
 * @param {'paper' | 'cover'} [props.variant='paper'] - papier ou capture
 * @param {'kraft' | 'cool'} [props.tone='kraft'] - teinte du papier
 * @param {string} [props.image] - la capture pré-floutée (`project.cover.blur`)
 */
export function LivingBackground({ variant = 'paper', tone = 'kraft', image }) {
  const modifiers =
    variant === 'cover'
      ? 'living-background--cover'
      : `living-background--paper living-background--${tone}`

  return (
    <div className={`living-background ${modifiers}`} aria-hidden="true">
      {variant === 'cover' && (
        // une image plutôt qu'un fond CSS, qui demanderait un style inline
        <img
          className="living-background__image"
          src={image}
          alt=""
          loading="lazy"
        />
      )}
    </div>
  )
}
