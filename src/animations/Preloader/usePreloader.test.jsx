import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { preferReducedMotion } from '../../testing/motion.js'
import { PLAYED_KEY, usePreloader } from './usePreloader.js'

describe('usePreloader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  const after = (ms) => act(() => vi.advanceTimersByTime(ms))

  it('drawing → opening à 2,45 s → ready à 2,9 s → done à 5,65 s', () => {
    const { result } = renderHook(() => usePreloader())
    expect(result.current.phase).toBe('drawing')
    after(2449)
    expect(result.current.phase).toBe('drawing')
    after(1)
    expect(result.current.phase).toBe('opening')
    after(450)
    expect(result.current.phase).toBe('ready')
    after(2749)
    expect(result.current.phase).toBe('ready')
    after(1)
    expect(result.current.phase).toBe('done')
  })

  it('retient qu’elle a été jouée, dès le départ', () => {
    renderHook(() => usePreloader())
    expect(window.sessionStorage.getItem(PLAYED_KEY)).toBe('1')
  })

  it('sautée sous « réduire les animations »', () => {
    preferReducedMotion()
    expect(renderHook(() => usePreloader()).result.current.phase).toBe('done')
  })

  it('sautée quand l’adresse vise une pièce (/#work)', () => {
    window.history.replaceState(null, '', '/#work')
    expect(renderHook(() => usePreloader()).result.current.phase).toBe('done')
  })

  it('sautée si déjà jouée pendant la session', () => {
    window.sessionStorage.setItem(PLAYED_KEY, '1')
    expect(renderHook(() => usePreloader()).result.current.phase).toBe('done')
  })

  it('stockage refusé (navigation privée) : elle joue, sans planter', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('refusé')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('refusé')
    })
    expect(renderHook(() => usePreloader()).result.current.phase).toBe(
      'drawing',
    )
  })

  it.each(['keyDown', 'pointerDown', 'wheel', 'touchStart'])(
    'au premier geste (%s) : ready tout de suite, done 0,5 s plus tard',
    (gesture) => {
      const { result } = renderHook(() => usePreloader())
      after(1000)
      act(() => fireEvent[gesture](window))
      expect(result.current).toEqual({ phase: 'ready', rushed: true })
      after(499)
      expect(result.current.phase).toBe('ready')
      after(1)
      expect(result.current.phase).toBe('done')
      after(5000) // l'ancien calendrier ne revient pas
      expect(result.current.phase).toBe('done')
    },
  )

  // revue : le minuteur normal de la fin disparaissait au geste — un geste
  // à 5,45 s finissait l'intro à 5,95 s au lieu de 5,65 s
  it('un geste dans la dernière demi-seconde n’allonge pas l’intro', () => {
    const { result } = renderHook(() => usePreloader())
    after(5450)
    act(() => fireEvent.keyDown(window, { key: 'Enter' }))
    after(200)
    expect(result.current.phase).toBe('done')
  })

  // revue : Maj seule, ou un raccourci du navigateur (Cmd+Tab, Cmd+L),
  // accéléraient l'intro — ce ne sont pas des gestes vers la page
  it.each([
    ['Maj seule', { key: 'Shift' }],
    ['Cmd+Tab', { key: 'Tab', metaKey: true }],
    ['Ctrl+L', { key: 'l', ctrlKey: true }],
    ['Alt seule', { key: 'Alt', altKey: true }],
  ])('%s n’accélère pas l’intro', (_, key) => {
    const { result } = renderHook(() => usePreloader())
    act(() => fireEvent.keyDown(window, key))
    expect(result.current.rushed).toBe(false)
  })

  it('Tab et Échap, si : des gestes vers la page', () => {
    const { result } = renderHook(() => usePreloader())
    act(() => fireEvent.keyDown(window, { key: 'Tab' }))
    expect(result.current.rushed).toBe(true)
  })

  it('les gestes s’écoutent sans retenir le défilement (passifs)', () => {
    const listen = vi.spyOn(window, 'addEventListener')
    renderHook(() => usePreloader())
    for (const type of ['keydown', 'pointerdown', 'wheel', 'touchstart']) {
      expect(listen).toHaveBeenCalledWith(type, expect.any(Function), {
        passive: true,
      })
    }
  })

  // ouverte dans un onglet en arrière-plan : personne ne la verrait, et le
  // brouillard (suspendu) et le calendrier (bridé) se désynchroniseraient
  it('ouverte en arrière-plan : sautée', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    })
    try {
      expect(renderHook(() => usePreloader()).result.current.phase).toBe('done')
    } finally {
      delete document.visibilityState
    }
  })

  it('finie, n’écoute plus les gestes', () => {
    const { result } = renderHook(() => usePreloader())
    after(5650)
    act(() => fireEvent.keyDown(window))
    expect(result.current).toEqual({ phase: 'done', rushed: false })
  })
})
