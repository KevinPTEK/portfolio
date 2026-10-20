import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Reveal, RevealItem } from '../../animations/Reveal/Reveal.jsx'
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
  // l'introduction suit le nombre de sites : un seul aujourd'hui (Tourn&Marou),
  // et un site ajouté aux données la remet au pluriel
  const lead =
    sites.length > 1
      ? 'Des sites vitrines intégrés pour des clients, en ligne.'
      : 'Un site vitrine intégré pour un client, en ligne.'

  return (
    <Room
      id="other-work"
      theme="paper-light"
      labelledBy="other-work-title"
      className="other-work"
      background={<LivingBackground tone="kraft" />}
    >
      <Reveal>
        <SectionHeader
          titleId="other-work-title"
          label="Et aussi"
          title="Autres réalisations."
          accent="réalisations."
          lead={lead}
          compact
        />
      </Reveal>
      {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10) */}
      <Reveal as="ul" stagger className="other-work__list" role="list">
        {sites.map((site) => (
          <RevealItem as="li" key={site.id} className="other-work__item">
            <SiteCard site={site} />
          </RevealItem>
        ))}
      </Reveal>
    </Room>
  )
}
