import { fireEvent, render } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollFrame } from './useScrollFrame.js'

// de faux requestAnimationFrame : une image toutes les 16 ms, à la main
function Probe({ onFrame }) {
  useScrollFrame(onFrame)
  return null
}

describe('useScrollFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('calcule une fois au montage : l’état de départ (rechargement à mi-page)', () => {
    const onFrame = vi.fn()
    render(<Probe onFrame={onFrame} />)
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it('plusieurs défilements dans la même image : un seul calcul, à l’image', () => {
    const onFrame = vi.fn()
    render(<Probe onFrame={onFrame} />)
    fireEvent.scroll(window)
    fireEvent.scroll(window)
    fireEvent.scroll(window)
    expect(onFrame).toHaveBeenCalledTimes(1) // pas avant l'image
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(2)
    // l'image suivante, sans nouveau défilement : rien
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(2)
  })

  it('deux images de suite, chacune avec son défilement : un calcul chacune', () => {
    // la première image traitée ne doit pas bloquer les suivantes
    const onFrame = vi.fn()
    render(<Probe onFrame={onFrame} />)
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(3)
  })

  it('recalcule aussi quand la fenêtre change de taille, à l’image', () => {
    const onFrame = vi.fn()
    render(<Probe onFrame={onFrame} />)
    fireEvent(window, new Event('resize'))
    expect(onFrame).toHaveBeenCalledTimes(1) // pas avant l'image
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(2)
  })

  it('appelle toujours la dernière fonction, sans réinstaller ses écouteurs', () => {
    const listen = vi.spyOn(window, 'addEventListener')
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Probe onFrame={first} />)
    rerender(<Probe onFrame={second} />)
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1) // le montage seulement
    expect(
      listen.mock.calls.filter(([type]) => type === 'scroll'),
    ).toHaveLength(1)
  })

  it('démonté : ses écouteurs de défilement et de taille sont retirés', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Probe onFrame={() => {}} />)
    unmount()
    for (const type of ['scroll', 'resize']) {
      const listener = add.mock.calls.find(([added]) => added === type)[1]
      expect(remove).toHaveBeenCalledWith(type, listener)
    }
  })

  it('en StrictMode (effets joués deux fois) : un calcul par image, rien ne reste', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const onFrame = vi.fn()
    const { unmount } = render(
      <StrictMode>
        <Probe onFrame={onFrame} />
      </StrictMode>,
    )
    onFrame.mockClear()
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(1)
    unmount()
    const count = (spy, type) =>
      spy.mock.calls.filter(([name]) => name === type).length
    expect(count(remove, 'scroll')).toBe(count(add, 'scroll'))
    expect(count(remove, 'resize')).toBe(count(add, 'resize'))
  })

  it('démonté : l’image attendue est annulée, plus aucun calcul', () => {
    const onFrame = vi.fn()
    const { unmount } = render(<Probe onFrame={onFrame} />)
    fireEvent.scroll(window)
    unmount()
    vi.advanceTimersByTime(16)
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    expect(onFrame).toHaveBeenCalledTimes(1)
  })
})
