import { useEffect, useEffectEvent, useState } from 'react'

// Une ligne horizontale au milieu de l'écran : la marge réduit la zone
// observée à cette ligne (50 % retirés en haut, 50 % en bas)
const MIDDLE_LINE = '-50% 0px -50% 0px'

/**
 * La pièce que l'on regarde : celle qui croise le milieu de l'écran. Quand
 * deux pièces le croisent (empilement : la suivante glisse par-dessus la
 * précédente, collée), c'est la dernière de la page, celle qui est dessus.
 * Recopie son thème sur <body> (la nav et le fond du document le suivent)
 * et donne la section du menu qui la contient (« argent » → « work »).
 *
 * IntersectionObserver plutôt qu'un écouteur de défilement : le navigateur
 * ne prévient qu'au passage de la ligne, sans calcul à chaque image (§ 7.7).
 *
 * @param {string[]} sectionIds - les id des cibles du menu (menu.json)
 * @returns {{ room: string | null, section: string | null }}
 *   l'id de la pièce courante et celui de sa section (null hors du menu)
 */
export function useCurrentRoom(sectionIds) {
  const [current, setCurrent] = useState({ room: null, section: null })

  // Effect Event (React 19.2) : lit toujours la dernière liste de sections,
  // sans relancer l'observateur quand elle change — il ne dépend que des
  // pièces ; la liste sert seulement à interpréter chaque passage de ligne
  const onRoomChange = useEffectEvent((room) => {
    document.body.dataset.theme = room.dataset.theme
    const section =
      sectionIds.find((id) => document.getElementById(id)?.contains(room)) ??
      null
    setCurrent((previous) =>
      previous.room === room.id ? previous : { room: room.id, section },
    )
  })

  useEffect(() => {
    const rooms = [...document.querySelectorAll('section.room[id]')]
    const crossing = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) crossing.add(target)
          else crossing.delete(target)
        }
        // la dernière dans l'ordre de la page : celle qui est peinte dessus ;
        // aucune (un interstice entre deux pièces) : on garde la courante
        const room = rooms.findLast((candidate) => crossing.has(candidate))
        if (room) onRoomChange(room)
      },
      { rootMargin: MIDDLE_LINE },
    )

    rooms.forEach((room) => observer.observe(room))
    return () => {
      observer.disconnect()
      // le thème par défaut (kraft, sur :root) reprend la main
      delete document.body.dataset.theme
    }
  }, [])

  return current
}
