// Mon portrait en trois tailles, partagé par l'accueil et la nav (puis
// l'avatar volant et « À propos ») — § 6, Avatar.
// ?no-inline : sous 4 Ko, Vite glisserait l'image dans le JS, et tous les
// visiteurs la téléchargeraient
import avatar128 from './avatar-128.webp?no-inline'
import avatar256 from './avatar-256.webp?no-inline'
import avatar512 from './avatar-512.webp?no-inline'

export const avatar = {
  src: avatar256,
  srcSet: `${avatar128} 128w, ${avatar256} 256w, ${avatar512} 512w`,
}
