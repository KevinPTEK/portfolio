import './LivingBackground.scss'

/**
 * Le fond d'une pièce, derrière son contenu : du papier (pièces personnelles)
 * ou la capture floutée d'un projet, voilée de la couleur de la pièce.
 * Décoratif : caché aux lecteurs d'écran. Immobile à l'étape 3 ; la capture
 * respirera à l'étape 4 (§ 7.8).
 * À passer à la prop `background` de Room.
 *
 * @param {object} props
 * @param {'paper' | 'cover'} [props.variant='paper'] - papier ou capture
 * @param {'kraft' | 'cool'} [props.tone='kraft'] - teinte du papier (kraft :
 *   accueil, contact ; cool : à propos, compétences) ; ignoré pour une capture
 * @param {string} [props.image] - la capture pré-floutée (`project.cover.blur`)
 *
 * @example
 * <Room id="home" theme="paper-light" labelledBy="home-title"
 *   background={<LivingBackground tone="kraft" />}>…</Room>
 * <LivingBackground variant="cover" image="/images/argent-cover-blur.webp" />
 */
export function LivingBackground({ variant = 'paper', tone = 'kraft', image }) {
  const modifiers =
    variant === 'cover'
      ? 'living-background--cover'
      : `living-background--paper living-background--${tone}`

  return (
    <div className={`living-background ${modifiers}`} aria-hidden="true">
      {variant === 'cover' && (
        // une image et non un fond CSS : son adresse change d'un projet à
        // l'autre, et un fond CSS demanderait un style inline
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
