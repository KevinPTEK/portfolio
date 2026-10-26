import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STROKES } from './seal.js'
import { Preloader } from './Preloader.jsx'

const root = document.documentElement

describe('Preloader', () => {
  it('un voile décoratif, avec le sceau : un cercle et six traits', () => {
    const { container } = render(<Preloader phase="drawing" rushed={false} />)
    const veil = container.querySelector('.preloader')
    expect(veil).toHaveAttribute('aria-hidden', 'true')
    expect(veil.querySelectorAll('circle')).toHaveLength(1)
    const paths = [...veil.querySelectorAll('path')]
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(
      STROKES.map(({ d }) => d),
    )
    expect(
      paths.filter((path) =>
        path.classList.contains('kr-seal__stroke--accent'),
      ),
    ).toHaveLength(3)
  })

  it('pose son état sur <html> (défilement bloqué, mise au point de l’accueil)', () => {
    const { rerender, unmount } = render(
      <Preloader phase="drawing" rushed={false} />,
    )
    expect(root.dataset.intro).toBe('drawing')
    rerender(<Preloader phase="ready" rushed />)
    expect(root.dataset.intro).toBe('ready')
    expect(root).toHaveAttribute('data-intro-rushed')
    unmount()
    expect(root.dataset.intro).toBeUndefined()
    expect(root).not.toHaveAttribute('data-intro-rushed')
  })

  it.each(['Preloader.scss', 'KrSeal.scss'])(
    'embarque ses styles (%s importé par son composant)',
    (file) => {
      // les tests du CSS compilent les fichiers à part : sans l'import, ils
      // resteraient verts et le build partirait sans ces styles
      render(<Preloader phase="drawing" rushed={false} />)
      expect(
        document.head.querySelector(`style[data-vite-dev-id$="${file}"]`),
      ).not.toBe(null)
    },
  )

  it('finie : plus rien, ni voile ni état', () => {
    const { container } = render(<Preloader phase="done" rushed={false} />)
    expect(container).toBeEmptyDOMElement()
    expect(root.dataset.intro).toBeUndefined()
  })

  it('sans canvas (happy-dom) : le voile reste en CSS, sans planter', () => {
    const { container } = render(<Preloader phase="opening" rushed={false} />)
    expect(container.querySelector('.preloader')).not.toHaveClass(
      'preloader--fog',
    )
  })
})

// Le brouillard, chargé après le premier affichage ; le voile CSS couvre
// l'attente. Un faux contexte 2D, et de fausses images
describe('Preloader — le brouillard', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData: (width, height) => ({
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData: vi.fn(),
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  const veil = () => document.querySelector('.preloader')

  it('chargé pendant le tracé, il prend le relais du voile CSS', async () => {
    render(<Preloader phase="drawing" rushed={false} />)
    await vi.dynamicImportSettled()
    act(() => vi.advanceTimersByTime(16))
    expect(veil()).toHaveClass('preloader--fog')
  })

  it('arrivé après l’ouverture : il ne sert plus, le voile s’efface en fondu', async () => {
    render(<Preloader phase="opening" rushed={false} />)
    await vi.dynamicImportSettled()
    act(() => vi.advanceTimersByTime(16))
    expect(veil()).not.toHaveClass('preloader--fog')
  })
})
