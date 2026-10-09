import { Button } from '../../components/Button/Button.jsx'
import profile from '../../data/profile.json'

/**
 * Le bouton du CV, partagé par « À propos » et « Contact » (il était écrit
 * deux fois, et les deux copies divergeaient déjà — revue du 9 oct.). Caché
 * tant que le PDF manque (profile.json : cv null) ; sinon un lien de
 * téléchargement qui dit son format et son poids (GOV.UK, AcceDe Web).
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
