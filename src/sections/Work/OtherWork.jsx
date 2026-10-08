import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { SiteCard } from '../../components/SiteCard/SiteCard.jsx'
import sites from '../../data/sites.json'
import './OtherWork.scss'

/**
 * « Autres réalisations » : après les projets phares, les sites vitrines en
 * grille de cartes (§ 5.1 bis). Ajouter un site à sites.json ajoute une carte.
 * Sur le papier kraft, avec un titre compact : les projets phares restent
 * les seules pièces en couleur, la pièce secondaire le reste à l'œil
 * (décisions de Kevin, 7 oct.).
 */
export function OtherWork() {
  return (
    <Room
      id="other-work"
      theme="paper-light"
      labelledBy="other-work-title"
      className="other-work"
    >
      <SectionHeader
        titleId="other-work-title"
        label="Et aussi"
        title="Autres réalisations."
        accent="réalisations."
        lead="Des sites vitrines intégrés pour des clients, en ligne."
        compact
      />
      {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10) */}
      <ul className="other-work__list" role="list">
        {sites.map((site) => (
          <li key={site.id} className="other-work__item">
            <SiteCard site={site} />
          </li>
        ))}
      </ul>
    </Room>
  )
}
