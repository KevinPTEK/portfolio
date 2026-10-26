import * as m from 'motion/react-m'
import { rise, stagger as cascade } from '../variants.js'
import './Reveal.scss'

// Une seule fois, quand le haut du bloc passe 15 % au-dessus du bas de
// l'écran. Une marge plutôt qu'une part du bloc (amount) : au zoom, un bloc
// très haut n'aurait jamais 15 % de lui-même visible
const VIEWPORT = { once: true, margin: '0px 0px -15% 0px' }
const CASCADE = cascade()

// Une table plutôt que m[as] : un accès calculé empêche le build de retirer
// les balises de Motion inutilisées
const TAGS = { a: m.a, div: m.div, li: m.li, ul: m.ul }

/**
 * Apparition au défilement : le bloc monte de 24 px en fondu, une seule fois.
 * Jamais sur l'accueil (LCP). Avec stagger, ses RevealItem arrivent l'un
 * après l'autre.
 *
 * @param {object} props
 * @param {'a' | 'div' | 'li' | 'ul'} [props.as='div'] - la balise rendue
 * @param {boolean} [props.stagger=false] - ses RevealItem arrivent en cascade
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 * Les autres props (href, role…) passent à l'élément.
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
 * Un élément d'un <Reveal stagger> : il suit l'état de son parent.
 *
 * @param {object} props
 * @param {'a' | 'div' | 'li' | 'ul'} [props.as='div'] - la balise rendue
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export function RevealItem({ as = 'div', className, children, ...rest }) {
  const Tag = TAGS[as]
  return (
    <Tag {...rest} className={withReveal(className)} variants={rise}>
      {children}
    </Tag>
  )
}

// la classe du CSS de secours (moteur absent, impression, focus clavier)
function withReveal(className) {
  return className ? `reveal ${className}` : 'reveal'
}
