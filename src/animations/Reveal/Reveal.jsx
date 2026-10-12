import * as m from 'motion/react-m'
import { rise, stagger as cascade } from '../variants.js'
import './Reveal.scss'

// Une seule fois, quand le haut du bloc passe 15 % au-dessus du bas de
// l'écran (§ 7.3). Une marge en hauteur d'écran plutôt qu'une part du bloc
// (amount: 0.15) : un bloc plus haut que 6,7 écrans n'aurait jamais 15 % de
// lui-même visible. Mesuré (revue) : la liste des compétences fait 6,8 écrans
// à 320 × 180 px (un écran de 1 280 × 720 zoomé à 400 %) — avec amount, ses
// cartes ne se montraient jamais
const VIEWPORT = { once: true, margin: '0px 0px -15% 0px' }
const CASCADE = cascade()

// Les balises que Reveal sait rendre. Une table plutôt que m[as] : avec un
// accès calculé, le build ne peut plus retirer les balises inutilisées, et
// les ~150 balises de Motion partaient au démarrage (2 Ko gzip, revue)
const TAGS = { a: m.a, div: m.div, li: m.li, ul: m.ul }

/**
 * Apparition au défilement (§ 7.3) : le bloc monte de 24 px en fondu, une
 * seule fois, quand il entre à l'écran. Jamais sur l'accueil (LCP). Avec
 * stagger, ce sont ses RevealItem qui arrivent l'un après l'autre.
 *
 * @param {object} props
 * @param {'a' | 'div' | 'li' | 'ul'} [props.as='div'] - la balise rendue : aucune enveloppe en plus
 * @param {boolean} [props.stagger=false] - ses enfants RevealItem arrivent en cascade
 * @param {string} [props.className] - classes BEM de l'élément (mêlées à « reveal »)
 * @param {import('react').ReactNode} props.children
 * Les autres props (href, role…) passent à l'élément.
 *
 * @example
 * <Reveal as="ul" stagger className="skills__groups" role="list">
 *   <RevealItem as="li" className="skills__group">…</RevealItem>
 * </Reveal>
 */
export function Reveal({
  as = 'div',
  stagger = false,
  className,
  children,
  ...rest
}) {
  const Tag = TAGS[as]
  return (
    <Tag
      {...rest}
      className={withReveal(className)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={stagger ? CASCADE : rise}
    >
      {children}
    </Tag>
  )
}

/**
 * Un élément d'une liste en cascade, dans un <Reveal stagger> : il suit
 * l'état de son parent.
 *
 * @param {object} props
 * @param {'a' | 'div' | 'li' | 'ul'} [props.as='div'] - la balise rendue
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 * Les autres props passent à l'élément.
 *
 * @example
 * <RevealItem as="li" className="other-work__item">…</RevealItem>
 */
export function RevealItem({ as = 'div', className, children, ...rest }) {
  const Tag = TAGS[as]
  return (
    <Tag {...rest} className={withReveal(className)} variants={rise}>
      {children}
    </Tag>
  )
}

// la classe que vise le CSS de secours (moteur absent, impression, focus
// clavier)
function withReveal(className) {
  return className ? `reveal ${className}` : 'reveal'
}
