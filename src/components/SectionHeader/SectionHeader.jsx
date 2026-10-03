import './SectionHeader.scss'

/**
 * En-tête d'une pièce : étiquette, grand titre avec un mot en accent,
 * introduction facultative. Des textes simples, pas de JSX.
 *
 * @param {object} props
 * @param {string} props.titleId - id du titre, à donner à la prop labelledBy de Room
 * @param {string} props.label - étiquette au-dessus du titre (« 03 — Compétences »)
 * @param {string} props.title - début du titre (« Compétences, »)
 * @param {string} props.accent - mot en accent, en italique (« honnêtement. »)
 * @param {string} [props.lead] - introduction sous le titre
 * @param {boolean} [props.compact=false] - plus petit : la pièce d'un projet partage la place avec sa capture
 *
 * @example
 * <SectionHeader
 *   titleId="skills-title"
 *   label="03 — Compétences"
 *   title="Compétences,"
 *   accent="honnêtement."
 * />
 */
export function SectionHeader({
  titleId,
  label,
  title,
  accent,
  lead,
  compact = false,
}) {
  const className = compact
    ? 'section-header section-header--compact'
    : 'section-header'

  return (
    <header className={className}>
      <p className="section-header__label">{label}</p>
      <h2 className="section-header__title" id={titleId}>
        {title} <span className="section-header__accent">{accent}</span>
      </h2>
      {lead && <p className="section-header__lead">{lead}</p>}
    </header>
  )
}
