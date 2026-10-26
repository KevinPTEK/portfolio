import './TagList.scss'

/**
 * Liste de mots-clés en pastilles (les technologies d'un projet).
 * Les tags ne sont pas cliquables : ce sont des informations, pas des liens.
 *
 * @param {object} props
 * @param {string[]} props.tags - mots-clés uniques, en casse normale (« React »)
 */
export function TagList({ tags = [] }) {
  // une liste vide serait annoncée « liste, 0 élément »
  if (tags.length === 0) return null
  return (
    // role="list" : sans puces, Safari ne l'annoncerait plus comme une liste
    <ul className="tag-list" role="list">
      {tags.map((tag) => (
        <li key={tag} className="tag-list__item">
          {tag}
        </li>
      ))}
    </ul>
  )
}
