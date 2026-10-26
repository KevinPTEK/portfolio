import { Button } from '../../components/Button/Button.jsx'
import profile from '../../data/profile.json'

/**
 * Le bouton du CV (« À propos », « Contact »). Caché tant que le PDF manque
 * (profile.json : cv null) ; il dit le format et le poids du fichier.
 *
 * @param {object} props
 * @param {'primary' | 'ghost'} [props.variant='ghost'] - plein ou bordé
 */
export function CvButton({ variant = 'ghost' }) {
  if (!profile.cv) return null

  return (
    <Button href={profile.cv.href} variant={variant} download>
      Télécharger mon CV (PDF, {profile.cv.size})
    </Button>
  )
}
