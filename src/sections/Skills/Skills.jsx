import { LivingBackground } from '../../animations/LivingBackground/LivingBackground.jsx'
import { Room } from '../../components/Room/Room.jsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.jsx'
import { SkillMeter } from '../../components/SkillMeter/SkillMeter.jsx'
import { sectionLabel } from '../../data/menuItems.js'
import projects from '../../data/projects.json'
import sites from '../../data/sites.json'
import skills from '../../data/skills.json'
import './Skills.scss'

// la preuve d'une compétence : un projet (sa pièce) ou un site (la pièce
// « Autres réalisations », où il a sa carte)
const evidence = new Map([
  ...projects.map(({ id, name }) => [id, { name, href: `#${id}` }]),
  ...sites.map(({ id, name }) => [id, { name, href: '#other-work' }]),
])

/**
 * « Compétences » : une carte par famille, une ligne par compétence — son
 * niveau (●●○, la légende en donne l'étalon) et, s'il y en a un, le projet
 * qui la montre (veille : une compétence se prouve par un projet). Papier froid.
 */
export function Skills() {
  return (
    <Room
      id="skills"
      theme="paper-cool"
      labelledBy="skills-title"
      className="skills"
      background={<LivingBackground tone="cool" />}
    >
      <SectionHeader
        titleId="skills-title"
        label={sectionLabel('skills')}
        title="Compétences, honnêtement."
        accent="honnêtement."
        // les mots du nom des points (« niveau 3 sur 3 ») : un lecteur d'écran
        // n'a pas à faire le rapprochement (revue du 9 oct.)
        lead={
          "Trois points (niveau 3 sur 3)\u00a0: à l'aise en autonomie. Deux (niveau 2)\u00a0: opérationnel avec de la pratique. Un (niveau 1)\u00a0: les bases, en cours d'approfondissement."
        }
      />
      {/* role="list" : sans puces, Safari ne l'annoncerait plus comme une liste (§ 10) */}
      <ul className="skills__groups" role="list">
        {skills.map(({ group, items }) => (
          <li key={group} className="skills__group">
            <h3 className="skills__group-title">{group}</h3>
            <ul className="skills__list" role="list">
              {items.map(({ name, detail, level, proof }) => {
                const work = evidence.get(proof)
                return (
                  <li key={name} className="skills__item">
                    <SkillMeter name={name} detail={detail} level={level} />
                    {work && (
                      <p className="skills__proof">
                        Vu dans <a href={work.href}>{work.name}</a>
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </Room>
  )
}
