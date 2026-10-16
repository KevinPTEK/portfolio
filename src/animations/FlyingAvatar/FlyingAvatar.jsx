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

const SIZE = 104 // le diamètre de départ, celui de l'accueil ; le vol le réduit par scale

/**
 * L'avatar « fil rouge » (§ 7.9) : du portrait de l'accueil jusqu'à sa place
 * dans la nav, au rythme du défilement. Décoratif (les deux portraits fixes
 * ont alt=""). Pendant le vol, <html data-avatar="flying"> efface les deux
 * emplacements (data-avatar-slot). Il entre en scène avec le bloc identité
 * de l'accueil (flou → net, § 7.4). Sous « réduire les animations », pas de
 * vol : chaque emplacement montre son portrait.
 *
 * @param {object} props
 * @param {boolean} [props.entered=true] - l'intro a rendu la main (ready) :
 *   il entre, avec l'accueil
 *
 * @example
 * <FlyingAvatar entered={intro.phase === 'ready' || intro.phase === 'done'} />
 */
export function FlyingAvatar({ entered = true }) {
  const reduced = useMediaQuery(REDUCED_MOTION)
  return reduced ? null : <Flight entered={entered} />
}

// Le vol (ses hooks ne tournent que s'il a lieu). Là où le navigateur connaît
// ScrollTimeline (Chrome, Edge, Safari 26+), il trace le vol lui-même, au
// rythme exact du défilement ; ailleurs (Firefox avant sa version 161), ou
// s'il refuse nos réglages, notre code le calcule à chaque image, avec une
// image de retard (mesuré, § 7.9)
function Flight({ entered }) {
  const [traced, setTraced] = useState(
    () => typeof ScrollTimeline === 'function',
  )

  // avant le premier affichage : sinon une image montrerait l'avatar volant
  // par-dessus le portrait de l'accueil (useLayoutEffect)
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.avatar = 'flying'
    return () => {
      delete root.dataset.avatar
    }
  }, [])

  return (
    // il entre avec le bloc identité de l'accueil : la même cascade (ENTRANCE)
    // et le même flou → net (unblur) ; dedans, l'image vole
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

// Le navigateur relie les points du vol (flightSamples) en suivant le
// défilement : rien à calculer à chaque image
function TimelineFlight({ onRefused }) {
  const image = useRef(null)
  const refuse = useEffectEvent(onRefused)

  // avant le premier affichage : sinon une image montrerait l'avatar en haut
  // à gauche de l'écran, hors de sa place (useLayoutEffect)
  useLayoutEffect(() => {
    let flight = null
    let geometry = null
    function fly() {
      const next = measureFlight()
      // un redimensionnement qui ne déplace pas les emplacements (la barre
      // d'adresse mobile se replie) : le même vol, rien à refaire
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
        // une option inconnue est ignorée sans erreur : un navigateur qui ne
        // retiendrait pas la plage ferait courir le vol sur toute la page.
        // Chrome rend la plage retenue (un objet), « normal » sans elle
        // (revue de branche)
        if (!flight.rangeEnd || flight.rangeEnd === 'normal') {
          throw new TypeError('plage ignorée')
        }
      } catch {
        flight?.cancel()
        // un navigateur qui refuserait ces réglages, ou ignorerait la plage :
        // notre code prend le relais. Une erreur ici ferait tomber toute la
        // page (revue)
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

  // la fenêtre change de taille : à remesurer, à l'image que useScrollFrame
  // demande alors
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

// Où partir (l'accueil, dans la page : il défile avec elle) et où se poser
// (la nav, dans l'écran : elle est fixe). La distance du vol suit la hauteur
// de l'écran barre d'adresse affichée (documentElement.clientHeight), qui ne
// bouge pas quand la barre se replie ; window.innerHeight, si : l'avatar
// sautait de 20 px en plein vol (revue)
function measureFlight() {
  const slot = (name) =>
    layoutOf(document.querySelector(`[data-avatar-slot="${name}"]`))
  return {
    from: slot('home'),
    to: slot('nav'),
    distance: flightDistance(document.documentElement.clientHeight),
  }
}

// La place d'un élément dans la mise en page, sans les transformations :
// offsetLeft et offsetTop les ignorent, getBoundingClientRect les mesure — or
// pendant l'intro, l'accueil est agrandi et son bloc identité décalé (§ 7.4),
// le départ aurait été faux jusqu'au prochain redimensionnement. On remonte
// les offsetParent (chaque décalage part de l'intérieur de la bordure du
// parent) : jusqu'à la page pour l'accueil, jusqu'à la nav fixe pour la nav
// (dont la place est dans l'écran)
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

// la position du vol, en transformation de l'image (écrite pendant
// l'exécution, § 7.1)
function transformOf({ x, y, size }) {
  return `translate(${x}px, ${y}px) scale(${size / SIZE})`
}
