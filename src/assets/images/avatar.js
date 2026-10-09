// Mon portrait en trois tailles, partagé par l'accueil, la nav et « À propos »
// (puis l'avatar volant) — § 6, Avatar.
// ?no-inline : sous 4 Ko, Vite glisserait l'image dans le JS — or un visiteur
// n'utilise qu'une des trois tailles : il téléchargerait les deux autres
import avatar128 from './avatar-128.webp?no-inline'
import avatar256 from './avatar-256.webp?no-inline'
import avatar512 from './avatar-512.webp?no-inline'
// le reflet flouté du portrait (« À propos ») : 856 octets, flou cuit dans
// l'image (outil bake-avatar-blur.mjs). Lui, Vite l'intègre au JS : il est
// unique et sert à tous — moins cher qu'une requête de plus (≈ 840 o en gzip)
import avatarBlur from './avatar-blur.webp'

export const avatar = {
  src: avatar256,
  srcSet: `${avatar128} 128w, ${avatar256} 256w, ${avatar512} 512w`,
  blur: avatarBlur,
}
