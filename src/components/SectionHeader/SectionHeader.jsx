import './SectionHeader.scss'

/**
 * En-tête d'une pièce : étiquette, grand titre avec un mot en accent,
 * introduction facultative. Des textes simples, pas de JSX.
 *
 * @param {object} props
 * @param {string} props.titleId - id du titre, à donner à la prop labelledBy de Room
 * @param {string} props.label - étiquette au-dessus du titre (« 03 — Compétences »)
 * @param {string} props.title - titre complet (« Compétences, honnêtement. »)
 * @param {string} props.accent - fin du titre mise en accent (« honnêtement. »)
 * @param {string} [props.lead] - introduction sous le titre
 * @param {boolean} [props.compact=false] - plus petit : la pièce d'un projet partage la place avec sa capture
 * @param {import('react').RefObject<HTMLHeadingElement>} [props.titleRef] - pour placer le focus
 *   sur le titre par le code
 */
export function SectionHeader({
  titleId,
  label,
  title,
  accent,
  lead,
  compact = false,
  titleRef,
}) {
  // un accent qui ne finit pas le titre (faute dans les données) est ignoré
  const hasAccent = Boolean(accent) && title.endsWith(accent)
  const start = hasAccent ? title.slice(0, title.length - accent.length) : title

  const className = compact
    ? 'section-header section-header--compact'
    : 'section-header'

  return (
    <header className={className}>
      <p className="section-header__label">{label}</p>
      <h2
        className="section-header__title"
        id={titleId}
        ref={titleRef}
        // focalisable par le code seulement, et seulement si on le demande
        tabIndex={titleRef ? -1 : undefined}
      >
        {start}
        {hasAccent && <span className="section-header__accent">{accent}</span>}
      </h2>
      {lead && <p className="section-header__lead">{lead}</p>}
    </header>
  )
}
