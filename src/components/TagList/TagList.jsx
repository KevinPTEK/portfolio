import './TagList.scss'

/**
 * Liste de mots-clés en pastilles (les technologies d'un projet).
 * Les tags ne sont pas cliquables : ce sont des informations, pas des liens.
 *
 * @param {object} props
 * @param {string[]} props.tags - mots-clés, en casse normale dans les données (« React »)
 *   (la mise en capitales est faite par le CSS) ; chacun doit être unique
 *
 * @example
 * <TagList tags={['React', 'React Router', 'Sass']} />
 */
export function TagList({ tags = [] }) {
  // une liste vide serait annoncée « liste, 0 élément » : on n'affiche rien
  if (tags.length === 0) return null
  return (
    // role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10)
    <ul className="tag-list" role="list">
      {tags.map((tag) => (
        <li key={tag} className="tag-list__item">
          {tag}
        </li>
      ))}
    </ul>
  )
}
