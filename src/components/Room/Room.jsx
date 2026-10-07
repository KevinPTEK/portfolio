import './Room.scss'

/**
 * Une pièce du site : une section d'au moins un écran de haut, aux couleurs
 * de son thème, avec un fond facultatif derrière le contenu.
 *
 * @param {object} props
 * @param {string} props.id - identifiant de la pièce : cible des liens, lien courant de la nav
 * @param {string} props.theme - thème de couleurs : `paper-light`, `paper-cool`, `argent`…
 * @param {string} props.labelledBy - id du titre qui nomme la pièce (sans nom, une section n'est pas une région)
 * @param {import('react').ReactNode} [props.background] - calque décoratif, dessiné derrière le contenu
 * @param {import('react').ReactNode} props.children - contenu de la pièce
 * @param {string} [props.className] - mix BEM : la classe de la section qui ajuste la pièce
 *   (l'accueil, sans nav visible, n'a pas les mêmes marges)
 *
 * @example
 * <Room id="about" theme="paper-cool" labelledBy="about-title">
 *   <h2 id="about-title">À propos</h2>
 * </Room>
 */
export function Room({
  id,
  theme,
  labelledBy,
  background,
  children,
  className,
}) {
  return (
    <section
      id={id}
      className={className ? `room ${className}` : 'room'}
      data-theme={theme}
      aria-labelledby={labelledBy}
    >
      {background}
      <div className="room__inner">{children}</div>
    </section>
  )
}
