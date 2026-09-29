import './Room.scss'

/**
 * Une pièce du site : une section d'au moins un écran de haut, aux couleurs
 * de son thème, avec un fond facultatif derrière le contenu.
 *
 * @param {object} props
 * @param {string} props.id - identifiant de la pièce : cible des liens, lien courant de la nav
 * @param {string} props.theme - thème de couleurs : `paper-light`, `paper-cool`, `kasa`…
 * @param {string} props.labelledBy - id du titre qui nomme la pièce (sans nom, une section n'est pas une région)
 * @param {import('react').ReactNode} [props.background] - calque décoratif, dessiné derrière le contenu
 * @param {import('react').ReactNode} props.children - contenu de la pièce
 *
 * @example
 * <Room id="about" theme="paper-cool" labelledBy="about-title">
 *   <h2 id="about-title">À propos</h2>
 * </Room>
 */
export function Room({ id, theme, labelledBy, background, children }) {
  return (
    <section
      id={id}
      className="room"
      data-theme={theme}
      aria-labelledby={labelledBy}
    >
      {background}
      <div className="room__inner">{children}</div>
    </section>
  )
}
