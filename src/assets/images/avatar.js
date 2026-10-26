// Mon portrait en trois tailles. ?no-inline : sous 4 Ko, Vite glisserait les
// images dans le JS, et chacun téléchargerait les trois
import avatar128 from './avatar-128.webp?no-inline'
import avatar256 from './avatar-256.webp?no-inline'
import avatar512 from './avatar-512.webp?no-inline'
// le reflet flouté (« À propos ») : intégré au JS, moins cher qu'une requête
import avatarBlur from './avatar-blur.webp'

export const avatar = {
  src: avatar256,
  srcSet: `${avatar128} 128w, ${avatar256} 256w, ${avatar512} 512w`,
  blur: avatarBlur,
}
