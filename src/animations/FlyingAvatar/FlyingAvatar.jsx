import * as m from 'motion/react-m'
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { avatar } from '../../assets/images/avatar.js'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { REDUCED_MOTION, useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useScrollFrame } from '../useScrollFrame.js'
import { ENTRANCE, unblur } from '../variants.js'
import { flightAt, flightDistance, flightSamples } from './flight.js'
import './FlyingAvatar.scss'

const SIZE = 104 // le diamètre de départ ; le vol le réduit par scale

/**
 * L'avatar « fil rouge » : du portrait de l'accueil jusqu'à sa place dans la
 * nav, au rythme du défilement. Décoratif. Pendant le vol, <html
 * data-avatar="flying"> efface les deux portraits fixes. Sous « réduire les
 * animations », pas de vol : chaque emplacement montre son portrait.
 *
 * @param {object} props
 * @param {boolean} [props.entered=true] - l'intro a rendu la main : il entre
 *   avec l'accueil
 */
export function FlyingAvatar({ entered = true }) {
  const reduced = useMediaQuery(REDUCED_MOTION)
  return reduced ? null : <Flight entered={entered} />
}

// Le vol. Avec ScrollTimeline, le navigateur le trace lui-même, collé au
// défilement ; sans elle (Firefox), ou s'il refuse nos réglages, notre code
// le calcule à chaque image
function Flight({ entered }) {
  const [traced, setTraced] = useState(
    () => typeof ScrollTimeline === 'function',
  )

  // avant le premier affichage, sinon deux avatars se superposent
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.avatar = 'flying'
    return () => {
      delete root.dataset.avatar
    }
  }, [])

  return (
    // il entre comme le bloc identité de l'accueil ; dedans, l'image vole
    <m.span
      className="flying-avatar"
      initial="hidden"
      animate={entered ? 'visible' : 'hidden'}
      variants={ENTRANCE}
    >
      <m.span className="flying-avatar__entrance" variants={unblur}>
        {traced ? (
          <TimelineFlight onRefused={() => setTraced(false)} />
        ) : (
          <ScriptedFlight />
        )}
      </m.span>
    </m.span>
  )
}

// Le navigateur relie les points du vol en suivant le défilement
function TimelineFlight({ onRefused }) {
  const image = useRef(null)
  const refuse = useEffectEvent(onRefused)

  // avant le premier affichage, sinon l'avatar passe une image hors de sa place
  useLayoutEffect(() => {
    let flight = null
    let geometry = null
    function fly() {
      const next = measureFlight()
      // la barre d'adresse mobile se replie : les emplacements n'ont pas bougé
      if (JSON.stringify(next) === JSON.stringify(geometry)) return
      geometry = next
      flight?.cancel() // l'ancien vol, mesuré sur l'ancienne mise en page
      try {
        flight = image.current.animate(keyframesOf(geometry), {
          timeline: new ScrollTimeline({ source: document.documentElement }),
          // du haut de la page à la fin du vol ; au-delà, posé dans la nav
          rangeStart: '0px',
          rangeEnd: `${geometry.distance}px`,
          fill: 'both',
        })
        // une option inconnue est ignorée sans erreur : sans la plage, le vol
        // courrait sur toute la page
        if (!flight.rangeEnd || flight.rangeEnd === 'normal') {
          throw new TypeError('plage ignorée')
        }
      } catch {
        flight?.cancel()
        // réglages refusés ou plage ignorée : notre code prend le relais
        flight = null
        refuse()
      }
    }

    fly()
    window.addEventListener('resize', fly)
    return () => {
      window.removeEventListener('resize', fly)
      flight?.cancel()
    }
  }, [])

  return <FlyingImage ref={image} />
}

// Notre code place l'avatar à chaque image où la page défile
function ScriptedFlight() {
  const image = useRef(null)
  const geometry = useRef(null) // null : à mesurer

  useScrollFrame(() => {
    geometry.current ??= measureFlight()
    image.current.style.transform = transformOf(
      flightAt(window.scrollY, geometry.current),
    )
  })

  // la fenêtre change de taille : à remesurer à la prochaine image
  useEffect(() => {
    const remeasure = () => {
      geometry.current = null
    }
    window.addEventListener('resize', remeasure)
    return () => window.removeEventListener('resize', remeasure)
  }, [])

  return <FlyingImage ref={image} />
}

function FlyingImage({ ref }) {
  return (
    <Avatar
      ref={ref}
      className="flying-avatar__image"
      src={avatar.src}
      srcSet={avatar.srcSet}
      alt=""
      size={SIZE}
    />
  )
}

// Où partir (l'accueil, dans la page) et où se poser (la nav, dans l'écran).
// clientHeight plutôt qu'innerHeight : il ne bouge pas quand la barre
// d'adresse mobile se replie
function measureFlight() {
  const slot = (name) =>
    layoutOf(document.querySelector(`[data-avatar-slot="${name}"]`))
  return {
    from: slot('home'),
    to: slot('nav'),
    distance: flightDistance(document.documentElement.clientHeight),
  }
}

// La place d'un élément sans ses transformations (pendant l'intro, l'accueil
// est agrandi) : offsetLeft et offsetTop les ignorent, getBoundingClientRect
// non. On remonte les offsetParent, en ajoutant leur bordure
function layoutOf(element) {
  let left = 0
  let top = 0
  for (let node = element; node; node = node.offsetParent) {
    left += node.offsetLeft
    top += node.offsetTop
    if (node.offsetParent) {
      left += node.offsetParent.clientLeft
      top += node.offsetParent.clientTop
    }
  }
  return { left, top, size: element.offsetWidth }
}

// le vol en images clés, pour le navigateur
function keyframesOf(geometry) {
  return flightSamples(geometry).map(({ offset, ...point }) => ({
    offset,
    transform: transformOf(point),
  }))
}

// la position du vol, en transformation de l'image
function transformOf({ x, y, size }) {
  return `translate(${x}px, ${y}px) scale(${size / SIZE})`
}
