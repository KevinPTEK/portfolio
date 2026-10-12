import { fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { preferReducedMotion } from '../testing/motion.js'
import { easeInOutQuint } from './easing.js'
import { scrollDuration, scrollTargetTop, useScrollTo } from './useScrollTo.js'

// le trajet remplacé : on vérifie ce qu'on lui demande, et on le termine ou
// l'interrompt à la main (scrollAnimation est testée à part)
const scroll = vi.hoisted(() => ({ run: vi.fn() }))
vi.mock('./scrollAnimation.js', () => ({ scrollAnimation: scroll.run }))
// scrollY est remplacé à chaque test, puis rendu
const SCROLL_Y = Object.getOwnPropertyDescriptor(window, 'scrollY')

function fakeAnimation() {
  let finish
  return {
    stop: vi.fn(),
    then: (resolve) => {
      finish = resolve
    },
    finish: () => finish(),
  }
}

function Page() {
  useScrollTo()
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <a href="#about">À propos</a>
      <a href="#skills">
        Compétences <span className="number">03</span>
      </a>
      <a href="#nowhere">Nulle part</a>
      <a href="#caf%C3%A9">Café</a>
      <a href="https://example.com/#about">Ailleurs</a>
      <main id="main" tabIndex={-1}>
        <section id="about">À propos</section>
        <div id="work">
          <section id="argent">Argent Bank</section>
          <section id="nina">Nina Carducci</section>
          <section id="events">724events</section>
        </div>
        <section id="skills">Compétences</section>
        <section id="café">Café</section>
      </main>
      <a className="footer__top" href="#main">
        Haut de page
      </a>
    </>
  )
}

const at = (id, top) => {
  document.getElementById(id).getBoundingClientRect = () => ({ top })
}

describe('scrollDuration', () => {
  it.each([
    [0, 0.5],
    [1000, 0.68],
    [-1000, 0.68],
    [10000, 1.4],
  ])('%s px : %s s', (distance, seconds) => {
    expect(scrollDuration(distance)).toBeCloseTo(seconds, 10)
  })
})

describe('useScrollTo', () => {
  let scrollTo
  beforeEach(() => {
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
    scroll.run.mockImplementation(() => fakeAnimation())
  })
  afterEach(() => {
    vi.restoreAllMocks()
    scroll.run.mockReset()
    window.history.replaceState(null, '', '/')
    document.documentElement.style.scrollPaddingTop = ''
    if (SCROLL_Y) Object.defineProperty(window, 'scrollY', SCROLL_Y)
    else delete window.scrollY
  })

  const click = (name, options) =>
    fireEvent.click(document.querySelector(`a[href="#${name}"]`), options)

  it('anime le défilement jusqu’à la pièce, à la durée et à la courbe de la charte', () => {
    render(<Page />)
    at('about', 800)
    const notPrevented = click('about')
    expect(notPrevented).toBe(false)
    expect(scroll.run).toHaveBeenCalledWith(100, 900, {
      duration: scrollDuration(800),
      ease: easeInOutQuint,
      onUpdate: expect.any(Function),
    })
    scroll.run.mock.calls[0][2].onUpdate(450)
    expect(scrollTo).toHaveBeenCalledWith(0, 450)
  })

  it('un clic sur le numéro, dans le lien, compte comme un clic sur le lien', () => {
    render(<Page />)
    at('skills', 1200)
    expect(fireEvent.click(document.querySelector('.number'))).toBe(false)
    expect(scroll.run.mock.calls[0][1]).toBe(1300)
  })

  it('s’arrête sous la barre du haut (scroll-padding-top)', () => {
    render(<Page />)
    document.documentElement.style.scrollPaddingTop = '56px'
    at('skills', 1200)
    click('skills')
    expect(scroll.run.mock.calls[0][1]).toBe(1244)
  })

  it('ne vise jamais au-dessus du haut de la page (« Haut de page » sous la barre)', () => {
    // le haut de <main> moins la barre donnerait -56 : la page s'arrêterait
    // à 0 avant la fin du trajet, et sa fin ralentie serait coupée
    render(<Page />)
    document.documentElement.style.scrollPaddingTop = '56px'
    at('about', -100)
    click('about')
    expect(scroll.run.mock.calls[0][1]).toBe(0)
  })

  it('met le focus sur la pièce et l’adresse à jour, comme le saut natif', () => {
    render(<Page />)
    at('about', 800)
    click('about')
    const about = document.getElementById('about')
    expect(about).toHaveAttribute('tabindex', '-1')
    expect(about).toHaveFocus()
    expect(window.location.hash).toBe('#about')
  })

  it('ajoute une entrée d’historique, une seule pour deux clics sur le même lien', () => {
    const pushState = vi.spyOn(window.history, 'pushState')
    render(<Page />)
    click('about')
    click('about')
    expect(pushState).toHaveBeenCalledTimes(1)
    expect(pushState).toHaveBeenCalledWith(null, '', '#about')
  })

  it('met le focus sans défiler : c’est le trajet qui défile', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    render(<Page />)
    click('about')
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it.each([
    ['ctrlKey', { ctrlKey: true }],
    ['metaKey', { metaKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['bouton du milieu', { button: 1 }],
  ])('laisse faire le navigateur avec %s', (_, options) => {
    render(<Page />)
    expect(click('about', options)).toBe(true)
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('laisse tranquille un clic déjà annulé par un autre code', () => {
    render(<Page />)
    const link = document.querySelector('a[href="#about"]')
    link.addEventListener('click', (event) => event.preventDefault())
    click('about')
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('laisse le lien d’évitement instantané', () => {
    render(<Page />)
    expect(click('main')).toBe(true)
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('« Haut de page » vise aussi #main, mais défile : seul le lien d’évitement est exclu', () => {
    render(<Page />)
    expect(fireEvent.click(document.querySelector('.footer__top'))).toBe(false)
    expect(scroll.run).toHaveBeenCalled()
  })

  it('n’intercepte pas un lien vers une autre page, même avec un #', () => {
    render(<Page />)
    // la navigation vers l'autre site est retenue, après notre écouteur
    window.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    })
    fireEvent.click(document.querySelector('a[href^="https:"]'))
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('trouve une cible dont l’id est encodé dans l’adresse (#caf%C3%A9)', () => {
    render(<Page />)
    at('café', 300)
    expect(
      fireEvent.click(document.querySelector('a[href="#caf%C3%A9"]')),
    ).toBe(false)
    expect(scroll.run.mock.calls[0][1]).toBe(400)
  })

  it('ignore une cible absente', () => {
    render(<Page />)
    expect(click('nowhere')).toBe(true)
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('sous « réduire les animations », laisse le saut natif', () => {
    preferReducedMotion()
    render(<Page />)
    expect(click('about')).toBe(true)
    expect(scroll.run).not.toHaveBeenCalled()
  })

  it('s’arrête au premier geste du visiteur, une seule fois', () => {
    render(<Page />)
    click('about')
    const animation = scroll.run.mock.results[0].value
    fireEvent.wheel(window)
    fireEvent.wheel(window)
    expect(animation.stop).toHaveBeenCalledTimes(1)
  })

  it.each(['wheel', 'touchStart', 'keyDown', 'pointerDown'])(
    'le geste « %s » reprend la main',
    (gesture) => {
      render(<Page />)
      click('about')
      fireEvent[gesture](window)
      expect(scroll.run.mock.results[0].value.stop).toHaveBeenCalled()
    },
  )

  it('le bouton Retour (popstate) arrête le trajet : le navigateur reprend la main', () => {
    render(<Page />)
    click('about')
    fireEvent.popState(window)
    expect(scroll.run.mock.results[0].value.stop).toHaveBeenCalled()
  })

  it('une touche maintenue (Entrée qui a déclenché le clic) ne l’arrête pas', () => {
    render(<Page />)
    click('about')
    const animation = scroll.run.mock.results[0].value
    fireEvent.keyDown(window, { key: 'Enter', repeat: true })
    expect(animation.stop).not.toHaveBeenCalled()
    // une vraie nouvelle touche, si
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(animation.stop).toHaveBeenCalled()
  })

  it('arrivé, ne réagit plus aux gestes', () => {
    render(<Page />)
    click('about')
    const animation = scroll.run.mock.results[0].value
    animation.finish()
    fireEvent.keyDown(window)
    expect(animation.stop).toHaveBeenCalledTimes(1) // celui de l'arrivée
  })

  it('un deuxième clic arrête le premier trajet, et la fin du premier ne coupe pas le second', () => {
    render(<Page />)
    click('about')
    click('skills')
    const [first, second] = scroll.run.mock.results.map(({ value }) => value)
    expect(first.stop).toHaveBeenCalled()
    first.finish()
    fireEvent.wheel(window)
    expect(second.stop).toHaveBeenCalledTimes(1)
  })

  it('la fin tardive du premier trajet n’efface pas le second : un 3e clic l’arrête encore', () => {
    // sinon deux trajets tourneraient ensemble (mutant survivant)
    render(<Page />)
    click('about')
    click('skills')
    const second = scroll.run.mock.results[1].value
    scroll.run.mock.results[0].value.finish()
    click('about')
    expect(second.stop).toHaveBeenCalled()
  })

  it('une pièce collée : vise sa place dans le flux, pas celle où elle colle', () => {
    render(<Page />)
    const events = document.getElementById('events')
    events.style.position = 'sticky'
    at('work', 1000)
    at('events', 0) // collée en haut : sa position ne dit rien
    // deux pièces avant elle, de hauteurs différentes : toutes comptent
    Object.defineProperty(document.getElementById('argent'), 'offsetHeight', {
      value: 700,
    })
    Object.defineProperty(document.getElementById('nina'), 'offsetHeight', {
      value: 300,
    })
    expect(scrollTargetTop(events)).toBe(1000 + 700 + 300 + 100)
  })

  it('lien direct (/#skills) : saute à la pièce après l’affichage, et y met le focus', () => {
    window.history.replaceState(null, '', '/#skills')
    // l'effet tourne au montage : la position se règle avant (rendue par restoreAllMocks)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
    })
    render(<Page />)
    expect(scrollTo).toHaveBeenCalledWith(0, 100)
    expect(document.getElementById('skills')).toHaveFocus()
  })

  it.each(['reload', 'back_forward'])(
    'rechargement ou Retour (%s) : le navigateur restaure la position, on ne saute pas',
    (type) => {
      window.history.replaceState(null, '', '/#skills')
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type }])
      render(<Page />)
      expect(scrollTo).not.toHaveBeenCalled()
    },
  )

  it.each(['/#%', '/#100%', '/#%E0%A4%A'])(
    'adresse mal formée (%s, lien tronqué) : la page s’affiche quand même',
    (url) => {
      window.history.replaceState(null, '', url)
      expect(() => render(<Page />)).not.toThrow()
      expect(document.querySelector('main')).not.toBe(null)
      expect(scrollTo).not.toHaveBeenCalled()
    },
  )

  it('lien direct vers une pièce absente : rien', () => {
    window.history.replaceState(null, '', '/#nope')
    render(<Page />)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('démonté pendant un trajet : le trajet s’arrête', () => {
    const { unmount } = render(<Page />)
    click('about')
    unmount()
    expect(scroll.run.mock.results[0].value.stop).toHaveBeenCalled()
  })

  it('démonté, n’écoute plus les clics (cible et lien remis dans la page)', () => {
    const { unmount } = render(<Page />)
    const link = document.querySelector('a[href="#about"]')
    const target = document.getElementById('about')
    unmount()
    document.body.append(link, target)
    fireEvent.click(link)
    expect(scroll.run).not.toHaveBeenCalled()
    link.remove()
    target.remove()
  })
})
