import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { avatar } from '../../assets/images/avatar.js'
import { preferReducedMotion } from '../../testing/motion.js'
import { MotionProvider } from '../MotionProvider.jsx'
import { FlyingAvatar } from './FlyingAvatar.jsx'

// Les deux emplacements, et l'avatar volant. happy-dom ne calcule aucune
// mise en page : chaque emplacement reçoit sa place (mesurée dans Chrome,
// bureau 1 440 × 900 : distance du vol = 405 px), l'écran sa hauteur
function Page({ entered }) {
  return (
    <>
      <div className="frame">
        <span data-avatar-slot="home" />
      </div>
      <span data-avatar-slot="nav" />
      <FlyingAvatar entered={entered} />
    </>
  )
}
const HEIGHT = window.innerHeight
// La place dans la mise en page (offsetLeft, offsetTop, offsetWidth) : dans la
// page pour l'accueil (il défile avec elle), dans l'écran pour la nav (fixe) ;
// parent : l'offsetParent, et border sa bordure (clientLeft, clientTop)
let boxes
let reads // les accesseurs espionnés : combien de lectures de la mise en page
const place = (slot, left, top, width) => {
  boxes[slot] = { left, top, width }
}
const boxOf = (element) =>
  boxes[element.dataset?.avatarSlot] ??
  (element.classList?.contains('frame') ? boxes.frame : undefined)
const layout = {
  offsetLeft: (box) => box?.left ?? 0,
  offsetTop: (box) => box?.top ?? 0,
  offsetWidth: (box) => box?.width ?? 0,
  clientLeft: (box) => box?.border ?? 0,
  clientTop: (box) => box?.border ?? 0,
}
const image = () => document.querySelector('.flying-avatar__image')
const entrance = () => document.querySelector('.flying-avatar__entrance')
// la transformation attendue : position, et diamètre rapporté aux 104 px de départ
const at = (x, y, size) => `translate(${x}px, ${y}px) scale(${size / 104})`

// la page rechargée à mi-vol
const reloadedAt = (y) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
}

// La hauteur de l'écran, barre d'adresse affichée (documentElement.clientHeight)
// et celle de la fenêtre (innerHeight), qui grandit quand la barre se replie
const screenHeight = (height, window_ = height) => {
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: height,
    configurable: true,
  })
  Object.defineProperty(window, 'innerHeight', {
    value: window_,
    configurable: true,
  })
}

beforeEach(() => {
  boxes = {}
  place('home', 40, 40, 104)
  place('nav', 32, 32, 56)
  reads = {}
  for (const [property, read] of Object.entries(layout)) {
    reads[property] = vi
      .spyOn(window.HTMLElement.prototype, property, 'get')
      .mockImplementation(function () {
        return read(boxOf(this))
      })
  }
  // happy-dom n'a pas offsetParent : le parent de l'accueil, s'il en a un
  Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', {
    get() {
      return this.dataset?.avatarSlot === 'home' && boxes.frame
        ? document.querySelector('.frame')
        : null
    },
    configurable: true,
  })
  screenHeight(900)
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete window.HTMLElement.prototype.offsetParent
  delete document.documentElement.clientHeight // le getter de happy-dom revient
  Object.defineProperty(window, 'innerHeight', {
    value: HEIGHT,
    configurable: true,
  })
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('FlyingAvatar', () => {
  it('un portrait décoratif, à la taille de départ', () => {
    render(<Page />)
    expect(image()).toHaveAttribute('alt', '')
    expect(image()).toHaveAttribute('src', avatar.src)
    expect(image()).toHaveAttribute('sizes', '104px')
    expect(image()).toHaveAttribute('width', '104')
    expect(image()).toHaveClass('avatar', 'flying-avatar__image')
  })

  // revue de la tâche 8 : à son montage, l'intro a agrandi l'accueil (1,05) et
  // décalé son bloc identité (14 px) — getBoundingClientRect mesurait un
  // départ faux. La mise en page (offset*) ignore les transformations
  it('mesure la place dans la mise en page, parents et bordures compris', () => {
    place('home', 10, 8, 104) // dans son cadre…
    boxes.frame = { left: 28, top: 30, border: 2 } // …placé dans la page
    render(<Page />)
    // 10 + 2 + 28 = 40 ; 8 + 2 + 30 = 40 : le départ habituel
    expect(image().style.transform).toBe(at(40, 40, 104))
  })

  // il entre avec le bloc identité de l'accueil (§ 7.4, comme la maquette) :
  // flou et 14 px plus bas tant que l'intro joue, jamais transparent
  it('pendant l’intro : flou et 14 px plus bas, comme le bloc identité', () => {
    render(<Page entered={false} />)
    expect(entrance().style.filter).toBe('blur(14px)')
    expect(entrance().style.transform).toBe('translateY(14px)')
    expect(entrance().style.opacity).toBe('')
    expect(entrance()).toContainElement(image())
  })

  describe('moteur chargé', () => {
    // les animations finissent tout de suite (réglage de Motion pour les tests)
    beforeEach(() => {
      MotionGlobalConfig.skipAnimations = true
    })
    afterEach(() => {
      MotionGlobalConfig.skipAnimations = false
    })

    it('tant que l’intro joue, il attend, même moteur chargé', async () => {
      const page = (entered) => (
        <MotionProvider>
          <Page entered={entered} />
        </MotionProvider>
      )
      const { rerender } = render(page(false))
      await vi.dynamicImportSettled()
      await act(async () => {})
      // deux images : Motion démarre une animation à l'image suivante
      await act(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      )
      expect(entrance().style.filter).toBe('blur(14px)')
      // contre-épreuve : la main rendue, il entre bien
      rerender(page(true))
      await waitFor(() => expect(entrance().style.filter).toBe('none'))
    })

    it('l’intro rend la main : il entre avec l’accueil, et finit net', async () => {
      render(
        <MotionProvider>
          <Page entered />
        </MotionProvider>,
      )
      await waitFor(() => expect(entrance().style.filter).toBe('none'))
      expect(entrance().style.transform).toBe('none')
    })
  })

  it('pendant le vol, efface les deux emplacements (<html data-avatar>)', () => {
    const { unmount } = render(<Page />)
    expect(document.documentElement.dataset.avatar).toBe('flying')
    unmount()
    expect(document.documentElement.dataset.avatar).toBeUndefined()
  })

  it.each([
    ['sans ScrollTimeline', () => {}],
    [
      'avec ScrollTimeline',
      () => {
        vi.stubGlobal('ScrollTimeline', class {})
        vi.spyOn(window.Element.prototype, 'animate').mockReturnValue({
          cancel() {},
          rangeEnd: { rangeName: 'none', offset: '405px' },
        })
      },
    ],
  ])('%s, démonté : chaque écouteur « resize » posé est retiré', (_, setUp) => {
    setUp()
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Page />)
    unmount()
    const resize = (spy) =>
      spy.mock.calls.filter(([type]) => type === 'resize').map(([, fn]) => fn)
    expect(resize(add).length).toBeGreaterThan(0)
    expect(resize(remove)).toEqual(expect.arrayContaining(resize(add)))
  })

  it('sous « réduire les animations » : pas de vol, les emplacements restent', () => {
    preferReducedMotion()
    const animate = vi.spyOn(window.Element.prototype, 'animate')
    render(<Page />)
    expect(image()).toBe(null)
    expect(document.documentElement.dataset.avatar).toBeUndefined()
    expect(animate).not.toHaveBeenCalled()
  })
})

// Sans ScrollTimeline (Firefox avant sa version 161, happy-dom) : le vol est
// calculé à chaque image où la page défile (faux requestAnimationFrame)
describe('FlyingAvatar — sans ScrollTimeline, à chaque image', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  const scrollTo = (y) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
  }

  it('part de l’accueil, passe à mi-vol, se pose dans la nav', () => {
    render(<Page />)
    expect(image().style.transform).toBe(at(40, 40, 104))
    scrollTo(202.5)
    expect(image().style.transform).toBe(at(34, -16.625, 68))
    scrollTo(405)
    expect(image().style.transform).toBe(at(32, 32, 56))
  })

  it('rechargée à mi-vol : à mi-vol dès le premier affichage', () => {
    reloadedAt(202.5)
    render(<Page />)
    expect(image().style.transform).toBe(at(34, -16.625, 68))
  })

  it('mesure les emplacements une fois, pas à chaque image', () => {
    render(<Page />)
    const before = reads.offsetTop.mock.calls.length
    scrollTo(100)
    scrollTo(200)
    scrollTo(300)
    expect(reads.offsetTop.mock.calls).toHaveLength(before)
  })

  it('remesure au redimensionnement : se pose sur la nouvelle place', () => {
    render(<Page />)
    scrollTo(500)
    place('nav', 20, 14, 28) // la nav devient la barre du haut
    fireEvent(window, new Event('resize'))
    vi.advanceTimersByTime(16)
    expect(image().style.transform).toBe(at(20, 14, 28))
  })

  // revue : la distance du vol suivait innerHeight — l'avatar sautait de
  // 20 px en plein vol quand la barre d'adresse mobile se repliait
  it('la barre d’adresse se replie (la fenêtre grandit) : l’avatar ne saute pas', () => {
    render(<Page />)
    scrollTo(202.5)
    screenHeight(900, 990)
    fireEvent(window, new Event('resize'))
    vi.advanceTimersByTime(16)
    expect(image().style.transform).toBe(at(34, -16.625, 68))
  })
})

// Avec ScrollTimeline (Chrome, Edge, Safari 26+) : le navigateur trace le vol
// lui-même, au rythme du défilement — une animation, recréée seulement quand
// les emplacements bougent
describe('FlyingAvatar — avec ScrollTimeline, tracé par le navigateur', () => {
  class FakeScrollTimeline {
    constructor(options) {
      this.options = options
    }
  }
  let flights
  beforeEach(() => {
    vi.stubGlobal('ScrollTimeline', FakeScrollTimeline)
    flights = []
    vi.spyOn(window.Element.prototype, 'animate').mockImplementation(
      (keyframes, options) => {
        // la plage retenue, comme Chrome la rend (rangeEnd)
        const flight = {
          keyframes,
          options,
          cancel: vi.fn(),
          rangeEnd: { rangeName: 'none', offset: options.rangeEnd },
        }
        flights.push(flight)
        return flight
      },
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('le vol entier en images clés, du départ à l’arrivée', () => {
    render(<Page />)
    expect(flights).toHaveLength(1)
    const { keyframes } = flights[0]
    expect(keyframes).toHaveLength(49)
    expect(keyframes[0]).toEqual({ offset: 0, transform: at(40, 40, 104) })
    expect(keyframes[24]).toEqual({
      offset: 0.5,
      transform: at(34, -16.625, 68),
    })
    expect(keyframes[48]).toEqual({ offset: 1, transform: at(32, 32, 56) })
    // sur l'image volante (revue : rien ne vérifiait la cible) ; rien d'écrit
    // dans son style : c'est l'animation qui la place
    expect(Element.prototype.animate.mock.contexts[0]).toBe(image())
    expect(image().style.transform).toBe('')
  })

  it('rechargée à mi-vol : le vol part quand même du haut de la page', () => {
    reloadedAt(202.5)
    render(<Page />)
    expect(flights[0].keyframes[0].transform).toBe(at(40, 40, 104))
    expect(flights[0].keyframes[48].transform).toBe(at(32, 32, 56))
  })

  it('sur les 405 premiers pixels du défilement de la page, et tenu au-delà', () => {
    render(<Page />)
    const { options } = flights[0]
    expect(options.timeline).toBeInstanceOf(FakeScrollTimeline)
    expect(options.timeline.options).toEqual({
      source: document.documentElement,
    })
    expect(options.rangeStart).toBe('0px')
    expect(options.rangeEnd).toBe('405px')
    expect(options.fill).toBe('both')
  })

  it('remesure au redimensionnement : un nouveau vol remplace l’ancien', () => {
    render(<Page />)
    place('nav', 20, 14, 28)
    screenHeight(568)
    fireEvent(window, new Event('resize'))
    expect(flights[0].cancel).toHaveBeenCalled()
    expect(flights).toHaveLength(2)
    expect(flights[1].keyframes.at(-1).transform).toBe(at(20, 14, 28))
    expect(flights[1].options.rangeEnd).toBe('260px')
  })

  it('la barre d’adresse se replie (la fenêtre grandit) : le vol reste le même', () => {
    render(<Page />)
    screenHeight(900, 990)
    fireEvent(window, new Event('resize'))
    expect(flights).toHaveLength(1)
    expect(flights[0].cancel).not.toHaveBeenCalled()
  })

  it('démonté : le vol s’arrête, et plus rien ne le relance', () => {
    const { unmount } = render(<Page />)
    unmount()
    expect(flights[0].cancel).toHaveBeenCalled()
    place('nav', 20, 14, 28)
    fireEvent(window, new Event('resize'))
    expect(flights).toHaveLength(1)
  })

  // revue : une erreur dans ce décor ferait tomber toute la page (aucune
  // barrière d'erreur) — un navigateur qui refuserait nos réglages
  // revue de branche : un navigateur qui connaît ScrollTimeline mais ignore
  // la plage (une option inconnue est ignorée sans erreur) ferait courir le
  // vol sur toute la page — on relit la plage retenue
  it.each([
    ['ignorée (« normal »)', 'normal'],
    ['inconnue (pas de rangeEnd)', undefined],
  ])('plage %s : notre code fait voler l’avatar', (_, rangeEnd) => {
    const cancel = vi.fn()
    Element.prototype.animate.mockImplementation(() => ({ cancel, rangeEnd }))
    render(<Page />)
    expect(cancel).toHaveBeenCalled()
    expect(image().style.transform).toBe(at(40, 40, 104))
  })

  it('refusé par le navigateur : notre code fait voler l’avatar', () => {
    Element.prototype.animate.mockImplementation(() => {
      throw new TypeError('rangeEnd')
    })
    render(<Page />)
    expect(image().style.transform).toBe(at(40, 40, 104))
    expect(document.documentElement.dataset.avatar).toBe('flying')
  })
})
